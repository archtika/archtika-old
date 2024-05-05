import archiver from "archiver";
import type { FastifyReply, FastifyRequest } from "fastify";
import { sql } from "kysely";
import { Renderer, parse } from "marked";
import type {
	CreateWebsiteSchemaType,
	GetWebsitesQuerySchemaType,
	UpdateWebsiteSchemaType,
	WebsiteParamsSchemaType,
} from "./websites-schemas.js";

export async function createWebsite(
	req: FastifyRequest<{ Body: CreateWebsiteSchemaType }>,
	reply: FastifyReply,
) {
	const { title, metaDescription } = req.body;

	const website = await req.server.kysely.db
		.insertInto("structure.website")
		.values({
			user_id: req.user?.id ?? "",
			title,
			meta_description: metaDescription,
			last_modified_by: req.user?.id ?? "",
		})
		.returningAll()
		.executeTakeFirstOrThrow();

	return reply.status(201).send(website);
}

export async function getAllWebsites(
	req: FastifyRequest<{ Querystring: GetWebsitesQuerySchemaType }>,
	reply: FastifyReply,
) {
	const isShared = req.query.shared ?? false;

	const allWebsites = await req.server.kysely.db
		.selectFrom("structure.website")
		.selectAll()
		.$if(!isShared, (qb) => qb.where("user_id", "=", req.user?.id ?? ""))
		.$if(isShared, (qb) =>
			qb.where(({ exists, selectFrom }) =>
				exists(
					selectFrom("collaboration.collaborator")
						.where("user_id", "=", req.user?.id ?? "")
						.where("permission_level", ">=", 10)
						.whereRef("website_id", "=", "structure.website.id"),
				),
			),
		)
		.execute();

	return reply.status(200).send(allWebsites);
}

export async function getWebsite(
	req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
	reply: FastifyReply,
) {
	const { id } = req.params;

	try {
		const website = await req.server.kysely.db
			.selectFrom("structure.website")
			.selectAll()
			.where(({ and, or, exists, selectFrom }) =>
				or([
					and({ id, user_id: req.user?.id }),
					exists(
						selectFrom("collaboration.collaborator")
							.where(and({ user_id: req.user?.id, website_id: id }))
							.where("permission_level", ">=", 10),
					),
				]),
			)
			.executeTakeFirstOrThrow();

		return reply.status(200).send(website);
	} catch (error) {
		return reply.notFound("Website not found or not allowed");
	}
}

export async function generateWebsite(
	req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
	reply: FastifyReply,
) {
	const { id } = req.params;

	const allPages = await req.server.kysely.db
		.selectFrom("structure.page")
		.selectAll()
		.where("website_id", "=", id)
		.execute();

	const archive = archiver("zip", {
		zlib: { level: 9 },
	});

	reply.header("Content-Type", "application/zip");
	reply.header(
		"Content-Disposition",
		`attachment; filename="website-${id}.zip"`,
	);

	archive.on("error", (err) => {
		return reply.send(err);
	});

	const renderer = new Renderer();
	renderer.image = (text) => text;

	for (const page of allPages) {
		const fileName = page.route === "/" ? "index.html" : `${page.route}.html`;

		const allComponents = await req.server.kysely.db
			.selectFrom("components.component")
			.innerJoin(
				"components.component_position",
				"components.component.id",
				"components.component_position.component_id",
			)
			.orderBy("components.component_position.row_start")
			.selectAll()
			.where("components.component.page_id", "=", page.id)
			.execute();

		let components = "";

		for (const component of allComponents as { [key: string]: any }[]) {
			switch (component.type) {
				case "text":
					components += parse(component.content.textContent, {
						renderer,
					});
					break;
				case "image":
					{
						const dataStream = await req.server.minio.client.getObject(
							"archtika",
							component.asset_id,
						);

						archive.append(dataStream, {
							name: `images/${component.asset_id}`,
						});

						components += `<img src="images/${component.asset_id}" alt="${component.content.altText}" />`;
					}
					break;
				case "video":
					{
						const dataStream = await req.server.minio.client.getObject(
							"archtika",
							component.asset_id,
						);

						archive.append(dataStream, {
							name: `videos/${component.asset_id}`,
						});

						components += `
							<video controls loop="${component.content.isLooped}" title="${component.content.altText}" src="videos/${component.asset_id}">
								<track default kind="captions" srclang="en" />
							</video>
						`;
					}
					break;
				case "audio":
					{
						const dataStream = await req.server.minio.client.getObject(
							"archtika",
							component.asset_id,
						);

						archive.append(dataStream, { name: `audio/${component.asset_id}` });

						components += `
							<audio controls title="${component.content.altText}" loop="${component.content.isLooped}">
            		<source src="audio/${component.asset_id}" />
        			</audio>
						`;
					}
					break;
			}
		}

		const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="description" content="${page.meta_description}">
  <title>${page.title}</title>
</head>
<body>
  <main>
		${components}
	</main>
</body>
</html>
    `;

		archive.append(content, { name: fileName });
	}

	archive.finalize();

	return reply.send(archive);
}

export async function updateWebsite(
	req: FastifyRequest<{
		Params: WebsiteParamsSchemaType;
		Body: UpdateWebsiteSchemaType;
	}>,
	reply: FastifyReply,
) {
	const { id } = req.params;
	const { title, metaDescription } = req.body;

	try {
		const website = await req.server.kysely.db
			.updateTable("structure.website")
			.set({
				title,
				meta_description: metaDescription,
				updated_at: sql`now()`,
				last_modified_by: req.user?.id,
			})
			.where(({ or, and, exists, selectFrom }) =>
				or([
					and({ id, user_id: req.user?.id }),
					exists(
						selectFrom("collaboration.collaborator")
							.where(and({ user_id: req.user?.id, website_id: id }))
							.where("permission_level", ">=", 30),
					),
				]),
			)
			.returningAll()
			.executeTakeFirstOrThrow();

		return reply.status(200).send(website);
	} catch (error) {
		return reply.notFound("Website not found or not allowed");
	}
}

export async function deleteWebsite(
	req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
	reply: FastifyReply,
) {
	const { id } = req.params;

	try {
		const website = await req.server.kysely.db
			.deleteFrom("structure.website")
			.where(({ and }) => and({ id, user_id: req.user?.id }))
			.returningAll()
			.executeTakeFirstOrThrow();

		return reply.status(200).send(website);
	} catch (error) {
		return reply.notFound("Website not found or not allowed");
	}
}
