import type { FastifyRequest } from "fastify";
import { type Transaction, sql } from "kysely";
import type { DB } from "kysely-codegen";

export async function sendNotify(
  req: FastifyRequest,
  channel: string,
  payload: string,
) {
  await sql`SELECT pg_notify(${sql.lit(channel)}, ${sql.lit(payload)})`.execute(
    req.server.kysely.db,
  );
}

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

export async function getMediaUrl(req: FastifyRequest, assetId: string | null) {
  const media = await req.server.kysely.db
    .selectFrom("media.media_asset")
    .select("mimetype")
    .where("id", "=", assetId)
    .executeTakeFirst();

  const url = `http://localhost:19000/media/${req.user?.id}/${assetId}.${media?.mimetype.split("/")[1].replace("svg+xml", "svg")}`;

  return url;
}

export async function getAllPages(req: FastifyRequest, websiteId: string) {
  const id = websiteId;

  const allPages = await req.server.kysely.db
    .selectFrom("structure.page")
    .selectAll()
    .where(({ or, and, exists, selectFrom }) =>
      or([
        exists(
          selectFrom("structure.website").where(
            and({ id, user_id: req.user?.id }),
          ),
        ),
        exists(
          selectFrom("collaboration.collaborator")
            .where(
              and({
                user_id: req.user?.id,
                website_id: id,
              }),
            )
            .where("permission_level", ">=", 10),
        ),
      ]),
    )
    .where("website_id", "=", id)
    .orderBy("route")
    .execute();

  return allPages;
}

export async function getPage(
  req: FastifyRequest,
  websiteId: string,
  pageId: string,
) {
  const page = await req.server.kysely.db
    .selectFrom("structure.page")
    .selectAll()
    .where(({ or, and, exists, selectFrom }) =>
      or([
        exists(
          selectFrom("structure.website").where(
            and({ id: websiteId, user_id: req.user?.id }),
          ),
        ),
        exists(
          selectFrom("collaboration.collaborator")
            .where(
              and({
                user_id: req.user?.id,
                website_id: websiteId,
              }),
            )
            .where("permission_level", ">=", 10),
        ),
      ]),
    )
    .where("id", "=", pageId)
    .executeTakeFirstOrThrow();

  return page;
}

export async function getAllComponents(req: FastifyRequest, pageId: string) {
  const allComponents = await req.server.kysely.db
    .selectFrom("components.component")
    .innerJoin(
      "components.component_position",
      "components.component.id",
      "components.component_position.component_id",
    )
    .innerJoin(
      "structure.page",
      "components.component.page_id",
      "structure.page.id",
    )
    .selectAll("components.component")
    .select([
      "components.component_position.row_start",
      "components.component_position.col_start",
      "components.component_position.row_end",
      "components.component_position.col_end",
      "components.component_position.row_end_span",
      "components.component_position.col_end_span",
    ])
    .where(({ or, eb }) =>
      or([
        eb("components.component.page_id", "=", pageId),
        eb("components.component.is_public", "=", true),
        eb("components.component.parent_id", "is not", null),
      ]),
    )
    .where(({ or, exists, selectFrom }) =>
      or([
        exists(
          selectFrom("structure.website").where(({ and }) =>
            and({
              id: selectFrom("structure.page")
                .select("website_id")
                .where("id", "=", pageId),
              user_id: req.user?.id,
            }),
          ),
        ),
        exists(
          selectFrom("collaboration.collaborator")
            .where(({ and }) =>
              and({
                website_id: selectFrom("structure.page")
                  .select("website_id")
                  .where("id", "=", pageId),
                user_id: req.user?.id,
              }),
            )
            .where("permission_level", ">=", 10),
        ),
      ]),
    )
    .where(({ eb, selectFrom }) =>
      eb(
        "structure.page.website_id",
        "=",
        selectFrom("structure.page")
          .select("website_id")
          .where("id", "=", pageId),
      ),
    )
    .orderBy(sql`
      CASE
        WHEN components.component.type = 'header' THEN 1
        WHEN components.component.type = 'footer' THEN 3
        ELSE 2
      END
    `)
    .orderBy("components.component_position.row_start")
    .orderBy("components.component_position.col_start")
    .orderBy("created_at")
    .execute();

  return allComponents;
}
