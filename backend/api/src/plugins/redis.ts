import fastifyRedis from "@fastify/redis";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function redis(fastify: FastifyInstance) {
	fastify.register(fastifyRedis, {
		host: "localhost",
		password: "dev",
		port: 16379,
		namespace: "sub",
		closeClient: true,
	});
	fastify.register(fastifyRedis, {
		host: "localhost",
		password: "dev",
		port: 16379,
		namespace: "pub",
		closeClient: true,
	});
}

export default fastifyPlugin(redis);
