import type { Kysely } from "kysely";
import type { DB } from "kysely-codegen";

export async function up(db: Kysely<DB>) {
  await db.schema
    .alterTable("components.component")
    .addColumn("is_public", "boolean", (col) => col.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<DB>) {
  await db.schema
    .alterTable("components.component")
    .dropColumn("is_public")
    .execute();
}
