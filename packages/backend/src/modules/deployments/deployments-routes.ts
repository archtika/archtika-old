import type { FastifyInstance } from "fastify";
import {
  downloadDeployment,
  viewDeployments,
} from "./deployments-controller.js";
import { downloadParamsSchema, paramsSchema } from "./deployments-schemas.js";

const commonSchema = {
  schema: {
    tags: ["deployments"],
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.get(
    "/:id/deployments",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: paramsSchema,
      },
    },
    viewDeployments,
  );

  fastify.get(
    "/:websiteId/deployments/:generation/download",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: downloadParamsSchema,
      },
    },
    downloadDeployment,
  );
}

export const autoPrefix = "/websites";
