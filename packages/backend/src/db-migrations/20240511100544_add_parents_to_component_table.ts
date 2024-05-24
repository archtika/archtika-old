import { type Kysely, sql } from "kysely";
import type { DB } from "kysely-codegen";

export async function up(db: Kysely<DB>) {
  await db.schema
    .alterTable("components.component")
    .addColumn("parent_id", "uuid", (col) =>
      col.references("components.component.id").onDelete("cascade"),
    )
    .execute();
}

export async function down(db: Kysely<DB>) {
  await db.schema
    .alterTable("components.component")
    .dropColumn("parent_id")
    .execute();
}
