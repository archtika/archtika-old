import type { FastifyRequest } from "fastify";
import type { Transaction } from "kysely";
import type { DB } from "kysely-codegen";

export async function updateLastModifiedByColumn(
	req: FastifyRequest,
	trx: Transaction<DB>,
) {
	await trx
		.updateTable("structure.website")
		.set({
			last_modified_by: req.user?.id,
		})
		.returningAll()
		.executeTakeFirstOrThrow();
}
