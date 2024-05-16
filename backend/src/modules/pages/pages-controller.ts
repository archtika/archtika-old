import type { FastifyReply, FastifyRequest } from "fastify";
import { sql } from "kysely";
import { updateLastModifiedByColumn } from "../../utils/queries.js";
import type {
	CreatePageSchemaType,
	PageParamsSchemaType,
	SinglePageParamsSchemaType,
	UpdatePageSchemaType,
} from "./pages-schemas.js";

export async function createPage(
	req: FastifyRequest<{
		Params: SinglePageParamsSchemaType;
		Body: CreatePageSchemaType;
	}>,
	reply: FastifyReply,
) {
	const { id } = req.params;
	const { route, title = "", metaDescription } = req.body;

	const page = await req.server.kysely.db.transaction().execute(async (trx) => {
		updateLastModifiedByColumn(req, trx);

		return await trx
			.insertInto("structure.page")
			.values(({ selectFrom, and, or, exists }) => ({
				website_id: selectFrom("structure.website")
					.select("id")
					.where(
						or([
							and({ id, user_id: req.user?.id }),
							exists(
								selectFrom("collaboration.collaborator")
									.where(
										and({
											user_id: req.user?.id,
											website_id: id,
										}),
									)
									.where("permission_level", ">=", 20),
							),
						]),
					),
				route,
				title,
				meta_description: metaDescription,
			}))
			.returningAll()
			.executeTakeFirstOrThrow();
	});

	return reply.status(201).send(page);
}

export async function getAllPages(
	req: FastifyRequest<{ Params: SinglePageParamsSchemaType }>,
	reply: FastifyReply,
) {
	const { id } = req.params;

	const allPages = await req.server.kysely.db
		.selectFrom("structure.page")
		.selectAll()
		.where(({ or, and, exists, selectFrom }) =>
			or([
				exists(
					selectFrom("structure.website").where(
						and({ id, user_id: req.user?.id }),
					),
				),
				exists(
					selectFrom("collaboration.collaborator")
						.where(
							and({
								user_id: req.user?.id,
								website_id: id,
							}),
						)
						.where("permission_level", ">=", 10),
				),
			]),
		)
		.where("website_id", "=", id)
		.execute();

	return reply.status(200).send(allPages);
}

export async function getPage(
	req: FastifyRequest<{ Params: PageParamsSchemaType }>,
	reply: FastifyReply,
) {
	const { pageId, websiteId } = req.params;

	const page = await req.server.kysely.db
		.selectFrom("structure.page")
		.selectAll()
		.where(({ or, and, exists, selectFrom }) =>
			or([
				exists(
					selectFrom("structure.website").where(
						and({ id: websiteId, user_id: req.user?.id }),
					),
				),
				exists(
					selectFrom("collaboration.collaborator")
						.where(
							and({
								user_id: req.user?.id,
								website_id: websiteId,
							}),
						)
						.where("permission_level", ">=", 10),
				),
			]),
		)
		.where("id", "=", pageId)
		.executeTakeFirstOrThrow();

	return reply.status(200).send(page);
}

export async function updatePage(
	req: FastifyRequest<{
		Params: PageParamsSchemaType;
		Body: UpdatePageSchemaType;
	}>,
	reply: FastifyReply,
) {
	const { pageId, websiteId } = req.params;
	const { route, title, metaDescription } = req.body;

	const page = await req.server.kysely.db.transaction().execute(async (trx) => {
		updateLastModifiedByColumn(req, trx);

		return await trx
			.updateTable("structure.page")
			.set({
				...(route ? { route } : {}),
				title,
				meta_description: metaDescription,
				updated_at: sql`now()`,
			})
			.where(({ exists, and, selectFrom, or }) =>
				or([
					exists(
						selectFrom("structure.website").where(
							and({
								id: websiteId,
								user_id: req.user?.id,
							}),
						),
					),
					exists(
						selectFrom("collaboration.collaborator")
							.where(
								and({
									user_id: req.user?.id,
									website_id: websiteId,
								}),
							)
							.where("permission_level", ">=", 20),
					),
				]),
			)
			.where("id", "=", pageId)
			.returningAll()
			.executeTakeFirstOrThrow();
	});

	return reply.status(200).send(page);
}

export async function deletePage(
	req: FastifyRequest<{ Params: PageParamsSchemaType }>,
	reply: FastifyReply,
) {
	const { pageId, websiteId } = req.params;

	const page = await req.server.kysely.db.transaction().execute(async (trx) => {
		updateLastModifiedByColumn(req, trx);

		return await trx
			.deleteFrom("structure.page")
			.where(({ exists, and, selectFrom, or }) =>
				or([
					exists(
						selectFrom("structure.website").where(
							and({
								id: websiteId,
								user_id: req.user?.id,
							}),
						),
					),
					exists(
						selectFrom("collaboration.collaborator")
							.where(
								and({
									user_id: req.user?.id,
									website_id: websiteId,
								}),
							)
							.where("permission_level", ">=", 20),
					),
				]),
			)
			.where(({ and }) => and({ id: pageId, website_id: websiteId }))
			.returningAll()
			.executeTakeFirstOrThrow();
	});

	return reply.status(200).send(page);
}
