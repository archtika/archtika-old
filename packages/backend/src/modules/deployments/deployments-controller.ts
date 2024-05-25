import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  DownloadParamsSchemaType,
  ParamsSchemaType,
} from "./deployments-schemas.js";

export async function viewDeployments(
  req: FastifyRequest<{ Params: ParamsSchemaType }>,
  reply: FastifyReply,
) {
  const { id } = req.params;

  const log = await req.server.kysely.db
    .selectFrom("tracking.deployment")
    .selectAll()
    .where(({ eb, and, exists, selectFrom }) =>
      and([
        eb("website_id", "=", id),
        exists(
          selectFrom("structure.website").where(
            and({ id, user_id: req.user?.id }),
          ),
        ),
      ]),
    )
    .orderBy("generation")
    .execute();

  return reply.status(200).send(log);
}

export async function downloadDeployment(
  req: FastifyRequest<{ Params: DownloadParamsSchemaType }>,
  reply: FastifyReply,
) {
  const { websiteId, generation } = req.params;

  await req.server.kysely.db
    .selectFrom("tracking.deployment")
    .selectAll()
    .where(({ eb, and, exists, selectFrom }) =>
      and([
        eb("website_id", "=", websiteId),
        eb("generation", "=", generation),
        exists(
          selectFrom("structure.website").where(
            and({ id: websiteId, user_id: req.user?.id }),
          ),
        ),
      ]),
    )
    .executeTakeFirstOrThrow();

  reply.header("Content-Type", "application/zip");
  reply.header(
    "Content-Disposition",
    `attachment; filename="website-${websiteId}-${generation}.zip"`,
  );

  const paddedDeploymentGenName = `${generation
    .toString()
    .padStart(2, "0")}.zip`;
  const deploymentPath = `${req.user?.id}/${websiteId}/${paddedDeploymentGenName}`;

  const stream = await req.server.minio.client.getObject(
    "deployments",
    deploymentPath,
  );

  return reply.status(200).send(stream);
}
