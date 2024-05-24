import fastifyMultipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function multipart(fastify: FastifyInstance) {
  fastify.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: {
      fileSize: 1024 * 1024 * 100,
    },
  });
}

export default fastifyPlugin(multipart);
