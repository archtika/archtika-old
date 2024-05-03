import { type Kysely, sql } from "kysely";
import type { DB } from "kysely-codegen";

export async function up(db: Kysely<DB>) {
	await db.schema.createSchema("media").execute();

	await db.schema
		.createTable("media.media_asset")
		.addColumn("id", "uuid", (col) => col.primaryKey().notNull())
		.addColumn("user_id", "uuid", (col) =>
			col.notNull().references("auth.auth_user.id").onDelete("cascade"),
		)
		.addColumn("name", "varchar", (col) => col.notNull())
		.addColumn("mimetype", "varchar", (col) =>
			col.notNull().check(
				sql`mimetype IN (
                        'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp',
                        'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg',
                        'video/mp4', 'video/webm', 'video/ogg'
                    )`,
			),
		)
		.addColumn("file_hash", "char(64)", (col) =>
			col.notNull().check(sql`file_hash ~ '^[a-f0-9]{64}$'`),
		)
		.addColumn("created_at", "timestamptz", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.addUniqueConstraint("uniqueFileHash", ["file_hash", "user_id"])
		.execute();
}

export async function down(db: Kysely<DB>) {
	await db.schema.dropTable("media.media_asset").execute();
	await db.schema.dropSchema("media").execute();
}
