import fastifyHelmet from "@fastify/helmet";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function helmet(fastify: FastifyInstance) {
  fastify.register(fastifyHelmet);
}

export default fastifyPlugin(helmet);
