import { createHash } from "node:crypto";
import archiver from "archiver";
import type { FastifyReply, FastifyRequest } from "fastify";
import { JSDOM } from "jsdom";
import { sql } from "kysely";
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

	const filesContent: { name: string; content: string }[] = [];

	for (const page of allPages) {
		const htmlData = await fetch(
			`http://localhost:5173/websites/${page.website_id}/pages/${page.id}`,
			{
				headers: {
					Cookie: `auth_session=${req.cookies.auth_session}`,
				},
			},
		);
		const html = await htmlData.text();

		const data = new JSDOM(html);

		const htmlContainer = data.window.document.querySelector(
			"[data-content-container]",
		);
		let htmlContent = "";

		const htmlElements = htmlContainer?.querySelectorAll("[data-component-id]");
		const groupedElements = new Map<number | string, Element[]>();

		for (const element of htmlElements || []) {
			const gridArea = new JSDOM().window
				.getComputedStyle(element)
				.getPropertyValue("grid-area");
			const [rowStart] = gridArea.split(" / ").map(Number);

			if (
				!element.hasAttribute("data-component-parent-type") &&
				!groupedElements.has(rowStart) &&
				!["header", "footer"].includes(
					element.getAttribute("data-component-type") as string,
				)
			) {
				groupedElements.set(rowStart, []);
			}

			for (const child of element.children) {
				if (child.hasAttribute("data-resizer")) continue;

				if (element.hasAttribute("data-component-parent-type")) {
					if (
						!groupedElements.has(
							element.getAttribute("data-component-parent-type") as string,
						)
					) {
						groupedElements.set(
							element.getAttribute("data-component-parent-type") as string,
							[],
						);
					}

					groupedElements
						.get(element.getAttribute("data-component-parent-type") as string)
						?.push(child);
					continue;
				}

				groupedElements.get(rowStart)?.push(child);
			}
		}

		const sortedGroupedElements = new Map(
			Array.from(groupedElements.entries()).sort(([keyA], [keyB]) => {
				if (keyA === "header") return -1;
				if (keyB === "header") return 1;
				if (keyA === "footer") return 1;
				if (keyB === "footer") return -1;
				if (typeof keyA === "number" && typeof keyB === "number") {
					return keyA - keyB;
				}
				return 0;
			}),
		);

		for (const [key, elements] of sortedGroupedElements) {
			if (["header", "footer"].includes(String(key))) {
				htmlContent += `<${key}>\n`;
				for (const element of elements) {
					htmlContent += `${element.outerHTML}\n`;
				}
				htmlContent += `</${key}>\n`;
			} else if (elements.length > 1) {
				// htmlContent += `<div class="grid">\n`;
				for (const element of elements) {
					htmlContent += `${element.outerHTML}\n`;
				}
				// htmlContent += "</div>\n";
			} else {
				htmlContent += `${elements[0].outerHTML}\n`;
			}
		}

		const fileName = page.route === "/" ? "index.html" : `${page.route}.html`;

		const content = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<link rel="stylesheet" href="styles.css" />
	<meta name="description" content="${page.meta_description}">
	<title>${page.title}</title>
</head>
<body>
	${htmlContent}
</body>
</html>
		`;

		archive.append(content, { name: fileName });
		filesContent.push({ name: fileName, content });
	}

	const cssData = await fetch("http://localhost:5173/api/styles", {
		headers: {
			Cookie: `auth_session=${req.cookies.auth_session}`,
		},
	});
	const css = `
		${await cssData.text()}

.grid {
	--min: 15ch;
	--gap: 1rem;

	display: grid;
	grid-gap: var(--gap);
	grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min)), 1fr));
}
	`;

	archive.append(css, { name: "styles.css" });
	filesContent.push({ name: "styles.css", content: css });

	await archive.finalize();

	const deploymentRowCount = await req.server.kysely.db
		.selectFrom("tracking.deployment")
		.select(({ fn }) => fn.countAll<string>().as("count"))
		.executeTakeFirstOrThrow();

	const deployment = await req.server.kysely.db
		.insertInto("tracking.deployment")
		.values({
			user_id: req.user?.id ?? "",
			generation: Number.parseInt(deploymentRowCount.count) + 1,
			file_hash: createHash("sha256")
				.update(JSON.stringify(filesContent))
				.digest("hex"),
		})
		.onConflict((oc) => oc.constraint("uniqueFileHash").doNothing())
		.returningAll()
		.executeTakeFirstOrThrow();

	await req.server.minio.client.putObject(
		"deployments",
		`${req.user?.id}/${id}/${deployment.generation
			.toString()
			.padStart(2, "0")}.zip`,
		archive,
		archive.pointer(),
		{
			"Content-Type": "application/zip",
		},
	);

	await fetch("http://localhost:12019/config/apps/http/servers/srv0/routes", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			handle: [
				{
					handler: "subroute",
					routes: [
						{
							handle: [
								{
									handler: "static_response",
									body: `Dynamic route for user ${req.user?.id} and website ${id} and deployment generation ${deployment.generation}`,
								},
							],
							match: [
								{
									path: [`/${req.user?.id}/${id}/${deployment.generation}`],
								},
							],
						},
					],
				},
			],
		}),
	});

	console.log(
		`Generated website http://localhost:18000/${req.user?.id}/${id}/${deployment.generation}`,
	);
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
}

export async function deleteWebsite(
	req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
	reply: FastifyReply,
) {
	const { id } = req.params;

	const website = await req.server.kysely.db
		.deleteFrom("structure.website")
		.where(({ and }) => and({ id, user_id: req.user?.id }))
		.returningAll()
		.executeTakeFirstOrThrow();

	return reply.status(200).send(website);
}
