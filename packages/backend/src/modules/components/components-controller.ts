import { mimeTypes } from "common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { sql } from "kysely";
import type WebSocket from "ws";
import {
  getExistingPresignedUrl,
  sendNotify,
  setupPgNotifyListener,
  updateLastModifiedByColumn,
} from "../../utils/queries.js";
import { getAllComponents as getAllComponentsUtil } from "../../utils/queries.js";
import type {
  ComponentPositionSchemaType,
  CreateComponentSchemaType,
  ParamsSchemaType,
  SingleParamsSchemaType,
  UpdateComponentSchemaType,
} from "./components-schemas.js";

export async function createComponent(
  req: FastifyRequest<{
    Params: SingleParamsSchemaType;
    Body: CreateComponentSchemaType;
  }>,
  reply: FastifyReply,
) {
  const { type, content } = req.body;
  const { id } = req.params;

  let assetId: string;
  let isPublic = false;

  if (type === "image" || type === "video" || type === "audio") {
    assetId = req.body.assetId;
  }

  if (type === "header" || type === "footer") {
    isPublic = true;
  }

  const component = await req.server.kysely.db
    .transaction()
    .execute(async (trx) => {
      updateLastModifiedByColumn(req, trx);

      const component = await trx
        .insertInto("components.component")
        .values(({ selectFrom }) => ({
          page_id: selectFrom("structure.page")
            .select("id")
            .where("id", "=", id)
            .where(({ or, exists, ref }) =>
              or([
                exists(
                  selectFrom("structure.website").where(({ and }) =>
                    and({
                      id: ref("structure.page.website_id"),
                      user_id: req.user?.id,
                    }),
                  ),
                ),
                exists(
                  selectFrom("collaboration.collaborator")
                    .where(({ and }) =>
                      and({
                        website_id: ref("structure.page.website_id"),
                        user_id: req.user?.id,
                      }),
                    )
                    .where("permission_level", ">=", 20),
                ),
              ]),
            ),
          type,
          content: JSON.stringify(content),
          ...(assetId
            ? {
                asset_id: selectFrom("media.media_asset")
                  .select("media.media_asset.id")
                  .where("media.media_asset.id", "=", assetId)
                  .where("media.media_asset.mimetype", "in", mimeTypes[type]),
              }
            : {}),
          is_public: isPublic,
          parent_id: req.body.parent_id
        }))
        .returningAll()
        .executeTakeFirstOrThrow();

        return component
    });

  let rowStart = 1
  let rowEnd = 2

  if (component.type === "footer") {
    const website = await req.server.kysely.db
      .selectFrom('structure.page')
      .select('website_id')
      .where('id', '=', id)
      .executeTakeFirstOrThrow()

    const componentMaxRow = await req.server.kysely.db
      .selectFrom("components.component_position as cp")
      .select(sql<number>`COALESCE(MAX(cp.row_end), 0) + 1`.as("new_row_start"))
      .innerJoin("components.component as c", "cp.component_id", "c.id")
      .innerJoin("structure.page as p", "c.page_id", "p.id")
      .where("c.type", "in", ["header", "section"])
      .where("p.website_id", "=", website.website_id)
      .executeTakeFirstOrThrow();

    rowStart = componentMaxRow.new_row_start
    rowEnd = componentMaxRow.new_row_start + 1

  } else if (component.type === "section") {
    const lastSectionEnding = await req.server.kysely.db
      .selectFrom("components.component_position as cp")
      .select(sql<number>`COALESCE(MAX(cp.row_end), 0) + 1`.as("new_row_start"))
      .innerJoin("components.component as c", "cp.component_id", "c.id")
      .innerJoin("structure.page as p", "c.page_id", "p.id")
      .where("c.type", "in", ["header", "section"])
      .where("c.page_id", "=", id)
      .executeTakeFirstOrThrow();

    rowStart = lastSectionEnding.new_row_start
    rowEnd = lastSectionEnding.new_row_start + 1
  }

  const componentPositionData = await req.server.kysely.db
    .insertInto('components.component_position')
    .values({
      component_id: component.id,
      row_start: rowStart,
      col_start: 1,
      row_end: rowEnd,
      col_end: 13,
      row_end_span: 0,
      col_end_span: 0,
    })
    .returningAll()
    .executeTakeFirst()

  const componentWithUrlAndPosition = {
    ...component,
    ...componentPositionData,
    url: await getExistingPresignedUrl(req, component.asset_id),
  };

  await sendNotify(
    req,
    `components_${id}`,
    JSON.stringify({
      operation_type: "create",
      data: componentWithUrlAndPosition,
      senderId: req.user?.id,
    }),
  );

  return reply.status(201).send(componentWithUrlAndPosition);
}

export async function getAllComponents(
  req: FastifyRequest<{ Params: SingleParamsSchemaType }>,
  reply: FastifyReply,
) {
  const { id } = req.params;

  const allComponents = await getAllComponentsUtil(req, id);

  const componentsWithUrls = await Promise.all(
    allComponents.map(async (component) => {
      return {
        ...component,
        url: await getExistingPresignedUrl(req, component.asset_id),
      };
    }),
  );

  return reply.status(200).send(componentsWithUrls);
}

export async function getAllComponentsWebsocket(
  socket: WebSocket,
  req: FastifyRequest<{ Params: SingleParamsSchemaType }>,
) {
  const { id } = req.params;

  const channelName = `components_${id}`;

  socket.on("message", async (message) => {
    await sendNotify(req, channelName, message.toString());
  });

  for (const client of req.server.websocketServer.clients as Set<
    WebSocket & { id?: string }
  >) {
    if (!client.id) {
      client.id = req.user?.id;
    }
  }

  await setupPgNotifyListener(req, channelName);
}

export async function getComponent(
  req: FastifyRequest<{ Params: ParamsSchemaType }>,
  reply: FastifyReply,
) {
  const { pageId, componentId } = req.params;

  const component = await req.server.kysely.db
    .selectFrom("components.component")
    .selectAll()
    .where(({ and }) =>
      and({
        page_id: pageId,
        id: componentId,
      }),
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
    .executeTakeFirstOrThrow();

  const componentWithUrl = {
    ...component,
    url: await getExistingPresignedUrl(req, component.asset_id),
  };

  return reply.status(200).send(componentWithUrl);
}

export async function updateComponent(
  req: FastifyRequest<{
    Params: ParamsSchemaType;
    Body: UpdateComponentSchemaType;
  }>,
  reply: FastifyReply,
) {
  const { pageId, componentId } = req.params;
  const { content, type } = req.body;

  let assetId: string | undefined;

  if (type === "image" || type === "video" || type === "audio") {
    assetId = req.body.assetId;
  }

  const component = await req.server.kysely.db
    .transaction()
    .execute(async (trx) => {
      updateLastModifiedByColumn(req, trx);

      return await trx
        .updateTable("components.component")
        .set({
          content: JSON.stringify(content),
          asset_id: assetId,
          updated_at: sql`now()`,
          parent_id: req.body.parent_id,
        })
        .where(({ and }) =>
          and({
            page_id: pageId,
            id: componentId,
            type,
          }),
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
                .where("permission_level", ">=", 20),
            ),
          ]),
        )
        .returningAll()
        .executeTakeFirstOrThrow();
    });

  const componentWithUrl = {
    ...component,
    url: await getExistingPresignedUrl(req, component.asset_id),
  };

  await sendNotify(
    req,
    `components_${pageId}`,
    JSON.stringify({
      operation_type: "update",
      data: componentWithUrl,
      senderId: req.user?.id,
    }),
  );

  return reply.status(200).send(componentWithUrl);
}

export async function deleteComponent(
  req: FastifyRequest<{
    Params: ParamsSchemaType;
  }>,
  reply: FastifyReply,
) {
  const { pageId, componentId } = req.params;

  const component = await req.server.kysely.db
    .transaction()
    .execute(async (trx) => {
      updateLastModifiedByColumn(req, trx);

      const componentType = await req.server.kysely.db
        .selectFrom("components.component")
        .select("type")
        .where("id", "=", componentId)
        .executeTakeFirstOrThrow();

      return await trx
        .deleteFrom("components.component")
        .where("id", "=", componentId)
        .$if(!["header", "footer"].includes(componentType.type), (qb) =>
          qb.where("page_id", "=", pageId),
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
                .where("permission_level", ">=", 20),
            ),
          ]),
        )
        .returningAll()
        .executeTakeFirstOrThrow();
    });

  const componentWithUrl = {
    ...component,
    url: await getExistingPresignedUrl(req, component.asset_id),
  };

  await sendNotify(
    req,
    `components_${pageId}`,
    JSON.stringify({
      operation_type: "delete",
      data: componentWithUrl,
      senderId: req.user?.id,
    }),
  );

  return reply.status(200).send(componentWithUrl);
}

export async function updateComponentPosition(
  req: FastifyRequest<{
    Params: SingleParamsSchemaType;
    Body: ComponentPositionSchemaType;
  }>,
  reply: FastifyReply,
) {
  const { id } = req.params;
  const { row_start, col_start, row_end, col_end, row_end_span, col_end_span } =
    req.body;

  const pageId = await req.server.kysely.db
    .selectFrom("components.component")
    .select("page_id")
    .where("id", "=", id)
    .executeTakeFirst();

  const componentPosition = await req.server.kysely.db
    .transaction()
    .execute(async (trx) => {
      updateLastModifiedByColumn(req, trx);

      return await trx
        .updateTable("components.component_position")
        .set({
          component_id: id,
          row_start,
          col_start,
          row_end,
          col_end,
          row_end_span,
          col_end_span,
        })
        .where("component_id", "=", id)
        .where(({ or, exists, selectFrom }) =>
          or([
            exists(
              selectFrom("structure.website").where(({ and }) =>
                and({
                  id: selectFrom("structure.page")
                    .select("website_id")
                    .where("id", "=", pageId?.page_id ?? ""),
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
                      .where("id", "=", pageId?.page_id ?? ""),
                    user_id: req.user?.id,
                  }),
                )
                .where("permission_level", ">=", 20),
            ),
          ]),
        )
        .returningAll()
        .executeTakeFirstOrThrow();
    });

  const { component_id, ...rest } = componentPosition;

  await sendNotify(
    req,
    `components_${pageId?.page_id}`,
    JSON.stringify({
      operation_type: "update-position",
      data: { id: component_id, ...rest },
      senderId: req.user?.id,
    }),
  );

  return reply.status(200).send(componentPosition);
}
