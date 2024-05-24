import type { FastifyInstance } from "fastify";
import {
  createPage,
  deletePage,
  getAllPages,
  getPage,
  updatePage,
} from "./pages-controller.js";
import {
  createPageSchema,
  pageParamsSchema,
  singlePageParamsSchema,
  updatePageSchema,
} from "./pages-schemas.js";

const commonSchema = {
  schema: {
    tags: ["pages"],
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/:id/pages",
    {
      schema: {
        tags: commonSchema.schema.tags,
        body: createPageSchema,
        params: singlePageParamsSchema,
      },
    },
    createPage,
  );

  fastify.get(
    "/:id/pages",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: singlePageParamsSchema,
      },
    },
    getAllPages,
  );

  fastify.get(
    "/:websiteId/pages/:pageId",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: pageParamsSchema,
      },
    },
    getPage,
  );

  fastify.patch(
    "/:websiteId/pages/:pageId",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: pageParamsSchema,
        body: updatePageSchema,
      },
    },
    updatePage,
  );

  fastify.delete(
    "/:websiteId/pages/:pageId",
    {
      schema: { tags: commonSchema.schema.tags, params: pageParamsSchema },
    },
    deletePage,
  );
}

export const autoPrefix = "/websites";
