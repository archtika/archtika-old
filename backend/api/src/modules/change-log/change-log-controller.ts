import type { FastifyReply, FastifyRequest } from "fastify";
import type { ParamsSchemaType } from "./change-log-schemas.js";

export async function viewChangeLog(
	req: FastifyRequest<{ Params: ParamsSchemaType }>,
	reply: FastifyReply,
) {
	const { id } = req.params;

	const log = await req.server.kysely.db
		.selectFrom("tracking.change_log")
		.selectAll()
		.where(({ eb, and, exists, selectFrom }) =>
			and([
				eb("website_id", "=", id),
				exists(
					selectFrom("structure.website").where(
						and({ id, user_id: req.user?.id }),
					),
				),
			]),
		)
		.execute();

	if (!log.length) {
		try {
			await req.server.kysely.db
				.selectFrom("structure.website")
				.select("id")
				.where(({ and }) => and({ id, user_id: req.user?.id }))
				.executeTakeFirstOrThrow();
		} catch (error) {
			return reply.notFound("Website not found or not allowed");
		}
	}

	return reply.status(200).send(log);
}
