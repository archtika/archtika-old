import type { Kysely } from "kysely";
import type { DB } from "kysely-codegen";

export async function up(db: Kysely<DB>) {
	await db.schema
		.createTable("media.media_asset_url")
		.addColumn("asset_id", "uuid", (col) =>
			col.primaryKey().references("media.media_asset.id").onDelete("cascade"),
		)
		.addColumn("presigned_url", "varchar", (col) => col.notNull())
		.addColumn("expiry_timestamp", "bigint", (col) => col.notNull())
		.execute();
}

export async function down(db: Kysely<DB>) {
	await db.schema.dropTable("media.media_asset_url").execute();
}
