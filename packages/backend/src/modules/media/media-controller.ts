import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { mimeTypes } from "common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { getMediaUrl } from "../../utils/queries.js";
import type {
  ParamsSchemaType,
  multipartFileSchemaType,
} from "./media-schemas.js";

interface Asset {
  id: string;
  user_id: string;
  name: string;
  mimetype: string;
  file_hash: string;
  url?: string | null;
}

export async function createMedia(
  req: FastifyRequest<{
    Body: { file: multipartFileSchemaType };
  }>,
  reply: FastifyReply,
) {
  const data = req.body.file;

  const isMimetypeValid = Object.values(mimeTypes).some((types) =>
    types.includes(data.mimetype),
  );

  if (!isMimetypeValid) {
    return reply.badRequest("Invalid file type");
  }

  const bufferData = await data.toBuffer();
  const buffer = Buffer.from(bufferData);

  const randomId = randomUUID();

  const media = await req.server.kysely.db
    .insertInto("media.media_asset")
    .values({
      id: randomId,
      user_id: req.user?.id ?? "",
      name: path.parse(data.filename).name,
      mimetype: data.mimetype,
      file_hash: createHash("sha256").update(buffer).digest("hex"),
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  const bucketName = "media";
  const objectName = `${req.user?.id}/${randomId}.${media.mimetype
    .split("/")[1]
    .replace("svg+xml", "svg")}`;

  await req.server.minio.client.putObject(
    bucketName,
    objectName,
    buffer,
    buffer.length,
    {
      "Content-Type": media.mimetype,
      "X-Amz-Meta-Original-Name": media.name,
      "X-Amz-Meta-File-Hash": media.file_hash,
    },
  );

  return reply.status(201).send(media);
}

export async function getAllMedia(req: FastifyRequest, reply: FastifyReply) {
  const media = await req.server.kysely.db
    .selectFrom("media.media_asset")
    .selectAll()
    .where("user_id", "=", req.user?.id ?? "")
    .execute();

  const assetsWithPresignedUrls = await Promise.all(
    media.map(async (asset) => {
      return {
        ...asset,
        url: await getMediaUrl(req, asset.id),
      };
    }),
  );

  const groupedAssets = assetsWithPresignedUrls.reduce(
    (acc: Record<string, Asset[]>, asset) => {
      let type: "image" | "audio" | "video";
      if (asset.mimetype.startsWith("image/")) {
        type = "image";
      } else if (asset.mimetype.startsWith("audio/")) {
        type = "audio";
      } else if (asset.mimetype.startsWith("video/")) {
        type = "video";
      } else {
        throw new Error("Invalid mimetype");
      }

      if (!acc[type]) {
        acc[type] = [];
      }

      acc[type].push(asset);

      return acc;
    },
    {},
  );

  return reply.status(200).send(groupedAssets);
}

export async function getMedia(
  req: FastifyRequest<{ Params: ParamsSchemaType }>,
  reply: FastifyReply,
) {
  const { id } = req.params;

  const media = await req.server.kysely.db
    .selectFrom("media.media_asset")
    .selectAll()
    .where(({ and }) => and({ id, user_id: req.user?.id }))
    .executeTakeFirstOrThrow();

  const assetWithPresignedUrl = {
    ...media,
    url: await getMediaUrl(req, media.id),
  };

  return reply.status(200).send(assetWithPresignedUrl);
}

export async function deleteMedia(
  req: FastifyRequest<{ Params: ParamsSchemaType }>,
  reply: FastifyReply,
) {
  const { id } = req.params;

  const media = await req.server.kysely.db
    .deleteFrom("media.media_asset")
    .where(({ and }) => and({ id, user_id: req.user?.id }))
    .returningAll()
    .executeTakeFirstOrThrow();

  await req.server.minio.client.removeObject(
    "media",
    `${req.user?.id}/${media.id}.${media.mimetype.split("/")[1].replace("svg+xml", "svg")}`,
  );

  return reply.status(200).send(media);
}
