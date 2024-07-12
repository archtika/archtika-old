import { type Kysely, sql } from "kysely";
import type { DB } from "kysely-codegen";

export async function up(db: Kysely<DB>) {
  await db.schema
    .alterTable("structure.page")
    .addColumn("depth", "smallint", (col) =>
      col.notNull().check(sql`depth >= 0`).defaultTo(0),
    )
    .execute();
}

export async function down(db: Kysely<DB>) {
  await db.schema.alterTable("structure.page").dropColumn("depth").execute();
}
