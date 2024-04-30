import fastifyWebsocket from "@fastify/websocket";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function websocket(fastify: FastifyInstance) {
	fastify.register(fastifyWebsocket, {
		logLevel: "debug",
	});
}

export default fastifyPlugin(websocket);
