import assert from "node:assert";
import { after, before, describe, it } from "node:test";
import type { FastifyInstance } from "fastify";
import { app as buildApp } from "../../index.js";
import { testUser } from "../../utils/testing/fakes.js";

describe("change-log", async () => {
	let app: FastifyInstance;
	let id: string;

	before(async () => {
		app = buildApp();
		await app.ready();

		await app.kysely.db
			.insertInto("auth.auth_user")
			.values({
				...testUser,
			})
			.onConflict((oc) => oc.column("id").doNothing())
			.execute();

		const website = await app.kysely.db
			.insertInto("structure.website")
			.values({
				user_id: testUser.id,
				title: "Some title",
				meta_description: "Some description",
				last_modified_by: testUser.id,
			})
			.returningAll()
			.executeTakeFirstOrThrow();

		id = website.id;
	});

	after(async () => {
		await app.close();
	});

	describe("GET /api/v1/websites/{id}/change-log", () => {
		it("should return 200 when a change-log array of objects is returned", async () => {
			const res = await app.inject({
				method: "GET",
				url: `/api/v1/websites/${id}/change-log`,
				headers: {
					origin: "http://localhost:3000",
					host: "localhost:3000",
				},
			});

			assert.deepStrictEqual(res.statusCode, 200);
		});
	});
});
