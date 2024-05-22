import { type Kysely, sql } from "kysely";
import type { DB } from "kysely-codegen";

export async function up(db: Kysely<DB>) {
	await db.schema
		.createTable("tracking.deployment")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("user_id", "uuid", (col) =>
			col.notNull().references("auth.auth_user.id").onDelete("cascade"),
		)
		.addColumn("generation", "smallint", (col) => col.notNull())
		.addColumn("file_hash", "char(64)", (col) =>
			col.notNull().check(sql`file_hash ~ '^[a-f0-9]{64}$'`),
		)
		.addColumn("created_at", "timestamptz", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.addUniqueConstraint("uniqueFileHash", ["file_hash", "user_id"])
		.execute();

	await db.schema
		.createTable("tracking.deployment_url")
		.addColumn("deployment_id", "uuid", (col) =>
			col.primaryKey().references("tracking.deployment.id").onDelete("cascade"),
		)
		.addColumn("presigned_url", "varchar", (col) => col.notNull())
		.addColumn("expiry_timestamp", "bigint", (col) => col.notNull())
		.execute();
}

export async function down(db: Kysely<DB>) {
	await db.schema.dropTable("tracking.deployment_url").execute();
	await db.schema.dropTable("tracking.deployment").execute();
}