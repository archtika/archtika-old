import type { FastifyReply, FastifyRequest } from "fastify";
import type { ParamsSchemaType } from "./deployments-schemas.js";

export async function viewDeployments(
	req: FastifyRequest<{ Params: ParamsSchemaType }>,
	reply: FastifyReply,
) {
	const { id } = req.params;

	const log = await req.server.kysely.db
		.selectFrom("tracking.deployment")
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
		.orderBy("generation")
		.execute();

	return reply.status(200).send(log);
}
