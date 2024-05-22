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

export async function getExistingPresignedUrl(
	req: FastifyRequest,
	assetId: string | null,
) {
	let presignedUrl = null;

	if (assetId) {
		const currentTimestamp = Date.now();

		const existingRecord = await req.server.kysely.db
			.selectFrom("media.media_asset_url")
			.selectAll()
			.where("asset_id", "=", assetId)
			.executeTakeFirst();

		if (
			existingRecord &&
			Number.parseInt(existingRecord.expiry_timestamp) > currentTimestamp
		) {
			presignedUrl = existingRecord.presigned_url;
		} else {
			const media = await req.server.kysely.db
				.selectFrom("media.media_asset")
				.select("mimetype")
				.where("id", "=", assetId)
				.executeTakeFirst();

			presignedUrl = await req.server.minio.client.presignedGetObject(
				"media",
				`${req.user?.id}/${assetId}.${media?.mimetype.split("/")[1]}`,
			);

			await req.server.kysely.db
				.insertInto("media.media_asset_url")
				.values({
					asset_id: assetId,
					presigned_url: presignedUrl,
					expiry_timestamp: currentTimestamp + 7 * 24 * 60 * 60 * 1000,
				})
				.onConflict((oc) =>
					oc.column("asset_id").doUpdateSet(({ ref }) => ({
						presigned_url: ref("excluded.presigned_url"),
						expiry_timestamp: ref("excluded.expiry_timestamp"),
					})),
				)
				.execute();
		}
	}

	return presignedUrl;
}
