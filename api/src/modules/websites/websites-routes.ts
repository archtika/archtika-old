import type { FastifyInstance } from "fastify";
import {
	createWebsite,
	deleteWebsite,
	generateWebsite,
	getAllWebsites,
	getWebsite,
	updateWebsite,
} from "./websites-controller.js";
import {
	createWebsiteSchema,
	getWebsitesQuerySchema,
	updateWebsiteSchema,
	websiteParamsSchema,
} from "./websites-schemas.js";

const commonSchema = {
	schema: {
		tags: ["websites"],
	},
};

export default async function (fastify: FastifyInstance) {
	fastify.post(
		"/",
		{
			schema: {
				body: createWebsiteSchema,
				tags: commonSchema.schema.tags,
			},
		},
		createWebsite,
	);

	fastify.get(
		"/",
		{
			schema: {
				querystring: getWebsitesQuerySchema,
				tags: commonSchema.schema.tags,
			},
		},
		getAllWebsites,
	);

	fastify.get(
		"/:id",
		{
			schema: {
				params: websiteParamsSchema,
				tags: commonSchema.schema.tags,
			},
		},
		getWebsite,
	);

	fastify.get(
		"/:id/generate",
		{
			schema: {
				params: websiteParamsSchema,
				tags: commonSchema.schema.tags,
			},
		},
		generateWebsite,
	);

	fastify.patch(
		"/:id",
		{
			schema: {
				params: websiteParamsSchema,
				body: updateWebsiteSchema,
				tags: commonSchema.schema.tags,
			},
		},
		updateWebsite,
	);

	fastify.delete(
		"/:id",
		{
			schema: {
				params: websiteParamsSchema,
				tags: commonSchema.schema.tags,
			},
		},
		deleteWebsite,
	);
}

export const autoPrefix = "/websites";
