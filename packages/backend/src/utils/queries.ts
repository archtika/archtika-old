import type { FastifyRequest } from "fastify";
import { type Transaction, sql } from "kysely";
import type { DB } from "kysely-codegen";
import type WebSocket from "ws";

export async function sendNotify(
  req: FastifyRequest,
  channel: string,
  payload: string,
) {
  await sql`SELECT pg_notify(${sql.lit(channel)}, ${sql.lit(payload)})`.execute(
    req.server.kysely.db,
  );
}

export async function setupPgNotifyListener(
  req: FastifyRequest,
  channelName: string,
) {
  const client = await req.server.pg.pool.connect();

  try {
    await client.query(`LISTEN "${channelName}"`);

    client.on("notification", (msg) => {
      const payload = JSON.parse(msg.payload ?? "");

      for (const wsClient of req.server.websocketServer.clients as Set<
        WebSocket & { id?: string }
      >) {
        if (wsClient.readyState === 1 && wsClient.id !== payload.senderId) {
          wsClient.send(msg.payload ?? "");
        }
      }
    });
  } catch (error) {
    console.error(
      `Error setting up PostgreSQL LISTEN for ${channelName}:`,
      error,
    );
    client.release();
  }
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
    .orderBy("created_at", "desc")
    .execute();

  return allComponents;
}
