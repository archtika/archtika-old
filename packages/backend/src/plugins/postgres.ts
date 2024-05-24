import fastifyPostgres from "@fastify/postgres";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function dbConnector(fastify: FastifyInstance) {
  fastify.register(fastifyPostgres, {
    connectionString: fastify.config.DATABASE_URL,
  });
}

export default fastifyPlugin(dbConnector, {
  name: "postgres",
});
