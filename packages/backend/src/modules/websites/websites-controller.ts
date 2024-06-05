import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import AdmZip from "adm-zip";
import { ElementFactory } from "common";
import type { Component } from "common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { sql } from "kysely";
import { getAllPages } from "../../utils/queries.js";
import { getAllComponents } from "../../utils/queries.js";
import type {
  CreateWebsiteSchemaType,
  GetWebsitesQuerySchemaType,
  UpdateWebsiteSchemaType,
  WebsiteParamsSchemaType,
} from "./websites-schemas.js";

export async function createWebsite(
  req: FastifyRequest<{ Body: CreateWebsiteSchemaType }>,
  reply: FastifyReply,
) {
  const { title, metaDescription } = req.body;

  const website = await req.server.kysely.db
    .insertInto("structure.website")
    .values({
      user_id: req.user?.id ?? "",
      title,
      meta_description: metaDescription,
      last_modified_by: req.user?.id ?? "",
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return reply.status(201).send(website);
}

export async function getAllWebsites(
  req: FastifyRequest<{ Querystring: GetWebsitesQuerySchemaType }>,
  reply: FastifyReply,
) {
  const isShared = req.query.shared ?? false;

  const allWebsites = await req.server.kysely.db
    .selectFrom("structure.website")
    .selectAll()
    .$if(!isShared, (qb) => qb.where("user_id", "=", req.user?.id ?? ""))
    .$if(isShared, (qb) =>
      qb.where(({ exists, selectFrom }) =>
        exists(
          selectFrom("collaboration.collaborator")
            .where("user_id", "=", req.user?.id ?? "")
            .where("permission_level", ">=", 10)
            .whereRef("website_id", "=", "structure.website.id"),
        ),
      ),
    )
    .orderBy("created_at")
    .execute();

  return reply.status(200).send(allWebsites);
}

export async function getWebsite(
  req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
  reply: FastifyReply,
) {
  const { id } = req.params;

  const website = await req.server.kysely.db
    .selectFrom("structure.website")
    .selectAll()
    .where(({ and, or, exists, selectFrom }) =>
      or([
        and({ id, user_id: req.user?.id }),
        exists(
          selectFrom("collaboration.collaborator")
            .where(and({ user_id: req.user?.id, website_id: id }))
            .where("permission_level", ">=", 10),
        ),
      ]),
    )
    .executeTakeFirstOrThrow();

  return reply.status(200).send(website);
}

function nestComponents(
  components: Component[],
  parentId: string | null = null,
): Component[] {
  const nested = components
    .filter((component) => component.parent_id === parentId)
    .map((component) => ({
      ...component,
      row_start: component.row_start,
      children: nestComponents(components, component.id),
    }));

  return nested;
}

export async function generateWebsite(
  req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
  reply: FastifyReply,
) {
  const { id } = req.params;

  const allPages = await getAllPages(req, id);

  if (allPages.length === 0) return;

  const zip = new AdmZip();
  const element = new ElementFactory();

  const fileContents = [];

  for (const page of allPages) {
    const fileName = page.route === "/" ? "index.html" : `${page.route}.html`;

    const allComponents = await getAllComponents(req, page.id);

    const allComponentsNested = nestComponents(allComponents as Component[]);

    let components = "";

    for (const component of allComponentsNested as Component[]) {
      const assetPaths = [];

      for (const comp of allComponents.filter(
        (c) =>
          c.parent_id === component.id &&
          ["image", "video", "audio"].includes(c.type),
      )) {
        const media = await req.server.kysely.db
          .selectFrom("media.media_asset")
          .select("mimetype")
          .where("id", "=", comp.asset_id ?? "")
          .executeTakeFirst();

        const mimeTypeExtension = media?.mimetype.split("/")[1];

        const dataStream = await req.server.minio.client.getObject(
          "media",
          `${req.user?.id}/${comp.asset_id}.${mimeTypeExtension}`,
        );

        const chunks = [];
        for await (const chunk of dataStream) {
          chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);

        zip.addFile(`assets/${comp.asset_id}.${mimeTypeExtension}`, buffer);

        const path = `./assets/${comp.asset_id}.${mimeTypeExtension}`;
        assetPaths.push(path);

        fileContents.push(buffer);
      }

      components += element.createElement(component, assetPaths);
    }

    const content = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<link rel="stylesheet" href="styles.css" />
	<meta name="description" content="${page.meta_description}">
	<title>${page.title}</title>
</head>
<body>
	${components}
</body>
</html>
		`;

    zip.addFile(fileName, Buffer.from(content));

    fileContents.push(Buffer.from(content));
  }

  const cssData = await fetch("http://localhost:5173/api/styles", {
    headers: {
      Cookie: `auth_session=${req.cookies.auth_session}`,
    },
  });
  const css = await cssData.text();

  zip.addFile("styles.css", Buffer.from(css));

  fileContents.push(Buffer.from(css));

  const buffer = zip.toBuffer();

  const hash = createHash("sha256");
  for (const content of fileContents) {
    hash.update(content);
  }
  const fileHash = hash.digest("hex");

  const deploymentRowCount = await req.server.kysely.db
    .selectFrom("tracking.deployment")
    .select(({ fn }) => fn.countAll<string>().as("count"))
    .executeTakeFirstOrThrow();

  const deployment = await req.server.kysely.db
    .insertInto("tracking.deployment")
    .values({
      user_id: req.user?.id ?? "",
      website_id: id,
      generation: Number.parseInt(deploymentRowCount.count) + 1,
      file_hash: fileHash,
    })
    .onConflict((oc) => oc.constraint("uniqueFileHash").doNothing())
    .returningAll()
    .executeTakeFirstOrThrow();

  const paddedDeploymentGenName = `${deployment.generation
    .toString()
    .padStart(2, "0")}.zip`;
  const deploymentPath = `${req.user?.id}/${id}/${paddedDeploymentGenName}`;

  await req.server.minio.client.putObject(
    "deployments",
    deploymentPath,
    buffer,
    buffer.length,
    {
      "Content-Type": "application/zip",
    },
  );

  try {
    const extractionPath = `/var/www/archtika-websites/${req.user?.id}/${id}`;

    await mkdir(extractionPath, { recursive: true });

    zip.extractAllTo(extractionPath, true);
  } catch (err) {
    console.error(err);
  }

  return reply.status(201).send("Website generated successfully.");
}

export async function updateWebsite(
  req: FastifyRequest<{
    Params: WebsiteParamsSchemaType;
    Body: UpdateWebsiteSchemaType;
  }>,
  reply: FastifyReply,
) {
  const { id } = req.params;
  const { title, metaDescription } = req.body;

  const website = await req.server.kysely.db
    .updateTable("structure.website")
    .set({
      title,
      meta_description: metaDescription,
      updated_at: sql`now()`,
      last_modified_by: req.user?.id,
    })
    .where(({ or, and, exists, selectFrom }) =>
      or([
        and({ id, user_id: req.user?.id }),
        exists(
          selectFrom("collaboration.collaborator")
            .where(and({ user_id: req.user?.id, website_id: id }))
            .where("permission_level", ">=", 30),
        ),
      ]),
    )
    .returningAll()
    .executeTakeFirstOrThrow();

  return reply.status(200).send(website);
}

export async function deleteWebsite(
  req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
  reply: FastifyReply,
) {
  const { id } = req.params;

  const website = await req.server.kysely.db
    .deleteFrom("structure.website")
    .where(({ and }) => and({ id, user_id: req.user?.id }))
    .returningAll()
    .executeTakeFirstOrThrow();

  return reply.status(200).send(website);
}
