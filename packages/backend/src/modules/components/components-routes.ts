import type { FastifyInstance } from "fastify";
import {
  createComponent,
  deleteComponent,
  getAllComponents,
  getAllComponentsWebsocket,
  getComponent,
  updateComponent,
  updateComponentPosition,
} from "./components-controller.js";
import {
  componentPositionSchema,
  createComponentSchema,
  paramsSchema,
  singleParamsSchema,
  updateComponentSchema,
} from "./components-schemas.js";

const commonSchema = {
  schema: {
    tags: ["components"],
  },
};

export default async function (fastify: FastifyInstance) {
  fastify.post(
    "/pages/:id/components",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: singleParamsSchema,
        body: createComponentSchema,
      },
    },
    createComponent,
  );

  fastify.route({
    method: "GET",
    url: "/pages/:id/components",
    schema: {
      tags: commonSchema.schema.tags,
    },
    handler: getAllComponents,
    wsHandler: getAllComponentsWebsocket,
  });

  fastify.get(
    "/pages/:pageId/components/:componentId",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: paramsSchema,
      },
    },
    getComponent,
  );

  fastify.patch(
    "/pages/:pageId/components/:componentId",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: paramsSchema,
        body: updateComponentSchema,
      },
    },
    updateComponent,
  );

  fastify.delete(
    "/pages/:pageId/components/:componentId",
    {
      schema: { tags: commonSchema.schema.tags },
    },
    deleteComponent,
  );

  fastify.patch(
    "/components/:id/position",
    {
      schema: {
        tags: commonSchema.schema.tags,
        params: singleParamsSchema,
        body: componentPositionSchema,
      },
    },
    updateComponentPosition,
  );
}

export const autoPrefix = "/";
