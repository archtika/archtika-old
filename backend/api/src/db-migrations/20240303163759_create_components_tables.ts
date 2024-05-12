import { type Kysely, sql } from "kysely";
import type { DB } from "kysely-codegen";

export async function up(db: Kysely<DB>) {
	await db.schema.createSchema("components").execute();
	await db.schema
		.createType("components.component_type")
		.asEnum(["text", "image", "video", "audio"])
		.execute();

	await db.schema
		.createTable("components.component")
		.addColumn("id", "uuid", (col) =>
			col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`),
		)
		.addColumn("type", sql`components.component_type`, (col) => col.notNull())
		.addColumn("page_id", "uuid", (col) =>
			col.notNull().references("structure.page.id").onDelete("cascade"),
		)
		.addColumn("content", "jsonb")
		.addColumn("asset_id", "uuid", (col) =>
			col
				.references("media.media_asset.id")
				.check(
					sql`type NOT IN ('image', 'video', 'audio') OR asset_id IS NOT NULL`,
				),
		)
		.addColumn("created_at", "timestamptz", (col) =>
			col.notNull().defaultTo(sql`now()`),
		)
		.addColumn("updated_at", "timestamptz")
		.execute();

	await db.schema
		.createTable("components.component_position")
		.addColumn("component_id", "uuid", (col) =>
			col
				.notNull()
				.primaryKey()
				.references("components.component.id")
				.onDelete("cascade"),
		)
		.addColumn("row_start", "integer", (col) => col.notNull())
		.addColumn("col_start", "integer", (col) =>
			col.notNull().check(sql`col_start >= 0`),
		)
		.addColumn("row_end", "integer", (col) => col.notNull())
		.addColumn("col_end", "integer", (col) =>
			col.notNull().check(sql`col_end >= 0`),
		)
		.addColumn("row_end_span", "integer", (col) =>
			col.notNull().check(sql`row_end_span >= 0`),
		)
		.addColumn("col_end_span", "integer", (col) =>
			col.notNull().check(sql`col_end_span >= 0`),
		)
		.execute();
}

export async function down(db: Kysely<DB>) {
	await db.schema.dropTable("components.component_position").execute();
	await db.schema.dropTable("components.component").execute();
	await db.schema.dropType("components.component_type").execute();
	await db.schema.dropSchema("components").execute();
}
