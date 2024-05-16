import fastifyEnv from "@fastify/env";
import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function env(fastify: FastifyInstance) {
	fastify.register(fastifyEnv, {
		schema: {
			type: "object",
			required: [
				"DEV_GITHUB_CLIENT_ID",
				"DEV_GITHUB_CLIENT_SECRET",
				"DEV_GOOGLE_CLIENT_ID",
				"DEV_GOOGLE_CLIENT_SECRET",
				"DATABASE_URL",
			],
			properties: {
				DEV_GITHUB_CLIENT_ID: { type: "string" },
				DEV_GITHUB_CLIENT_SECRET: { type: "string" },
				DEV_GOOGLE_CLIENT_ID: { type: "string" },
				DEV_GOOGLE_CLIENT_SECRET: { type: "string" },
				DATABASE_URL: { type: "string" },
			},
		},
		dotenv: true,
	});
}

export default fastifyPlugin(env);
