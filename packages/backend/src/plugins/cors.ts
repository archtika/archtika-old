import fastifyCors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function cors(fastify: FastifyInstance) {
  fastify.register(fastifyCors);
}

export default fastifyPlugin(cors);
