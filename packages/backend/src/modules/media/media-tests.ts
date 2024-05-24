import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import type { FastifyInstance } from "fastify";
import { app as buildApp } from "../../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("media", async () => {
  let app: FastifyInstance;
  let id: string;

  before(async () => {
    app = buildApp();
  });

  after(async () => {
    await app.close();
  });

  describe("POST /api/v1/media", () => {
    it(
      "should return 201 when the payload is valid",
      { skip: true },
      async () => {
        const fileName = "test-image.jpg";
        const filePath = resolve(
          __dirname,
          "../../../src/utils/testing/test-image.jpg",
        );
        const rawFileData = await readFile(filePath);
        const blob = new Blob([rawFileData]);
        const form = new FormData();
        form.append("file", blob, fileName);

        const res = await app.inject({
          method: "POST",
          url: "/api/v1/media",
          headers: {
            origin: "http://localhost:3000",
            host: "localhost:3000",
          },
          payload: form,
        });

        assert.deepStrictEqual(res.statusCode, 201);
      },
    );
  });

  describe("GET /api/v1/media", () => {
    it("should return 200 when an array of asset objects is returned", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/media",
        headers: {
          origin: "http://localhost:3000",
          host: "localhost:3000",
        },
      });

      assert.deepStrictEqual(res.statusCode, 200);
    });
  });

  describe("GET /api/v1/media/{id}", () => {
    it(
      "should return 200 when an array of asset objects is returned",
      { skip: true },
      async () => {
        const res = await app.inject({
          method: "GET",
          url: `/api/v1/media/${id}`,
          headers: {
            origin: "http://localhost:3000",
            host: "localhost:3000",
          },
        });

        assert.deepStrictEqual(res.statusCode, 200);
      },
    );
  });

  describe("DELETE /api/v1/media", () => {
    it(
      "should return 200 when an asset object is returned",
      { skip: true },
      async () => {
        const res = await app.inject({
          method: "DELETE",
          url: "/api/v1/media",
          headers: {
            origin: "http://localhost:3000",
            host: "localhost:3000",
          },
        });

        assert.deepStrictEqual(res.statusCode, 200);
      },
    );
  });
});
