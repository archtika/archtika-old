import { type Kysely, sql } from "kysely";
import type { DB } from "kysely-codegen";

export async function up(db: Kysely<DB>) {
  await db.schema.createSchema("structure").execute();

  await db.schema
    .createTable("structure.website")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("user_id", "uuid", (col) =>
      col.notNull().references("auth.auth_user.id").onDelete("cascade"),
    )
    .addColumn("title", "varchar(50)", (col) => col.notNull())
    .addColumn("meta_description", "varchar(200)")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz")
    .addColumn("last_modified_by", "uuid", (col) =>
      col.notNull().references("auth.auth_user.id").onDelete("cascade"),
    )
    .execute();

  await db.schema
    .createTable("structure.page")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().notNull().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("website_id", "uuid", (col) =>
      col.notNull().references("structure.website.id").onDelete("cascade"),
    )
    .addColumn("route", "varchar(200)", (col) =>
      col
        .notNull()
        .check(
          sql`route ~ '^/(|[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)$'`,
        ),
    )
    .addColumn("title", "varchar(50)", (col) => col.notNull())
    .addColumn("meta_description", "varchar(200)")
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("updated_at", "timestamptz")
    .addUniqueConstraint("uniqueRoute", ["website_id", "route"])
    .execute();
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable("structure.page").execute();
  await db.schema.dropTable("structure.website").execute();
  await db.schema.dropSchema("structure").execute();
}
