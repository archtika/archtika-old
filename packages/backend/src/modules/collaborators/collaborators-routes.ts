import type { FastifyInstance } from "fastify";
import {
  addCollaborator,
  getAllCollaborators,
  removeCollaborator,
  updateCollaborator,
} from "./collaborators-controller.js";
import {
  collaboratorSchema,
  paramsSchema,
  singleParamsSchema,
} from "./collaborators-schemas.js";

const commonSchema = {
  schema: {
    tags: ["collaborators"],
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/:id/collaborators",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: singleParamsSchema,
      },
    },
    getAllCollaborators,
  );

  fastify.post(
    "/:websiteId/collaborators/:userId",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: paramsSchema,
        body: collaboratorSchema,
      },
    },
    addCollaborator,
  );

  fastify.patch(
    "/:websiteId/collaborators/:userId",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: paramsSchema,
        body: collaboratorSchema,
      },
    },
    updateCollaborator,
  );

  fastify.delete(
    "/:websiteId/collaborators/:userId",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: paramsSchema,
      },
    },
    removeCollaborator,
  );
}

export const autoPrefix = "/websites";
