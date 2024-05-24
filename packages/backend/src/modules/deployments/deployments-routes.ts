import type { FastifyInstance } from "fastify";
import { viewDeployments } from "./deployments-controller.js";
import { paramsSchema } from "./deployments-schemas.js";

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
}

export const autoPrefix = "/websites";
