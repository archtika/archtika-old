import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { Client } from "minio";

async function minio(fastify: FastifyInstance) {
	const minioClient = new Client({
		endPoint: "localhost",
		port: 19000,
		useSSL: false,
		accessKey: "minioadmin",
		secretKey: "minioadmin",
	});

	minioClient.bucketExists("archtika", (err, exists) => {
		if (err) return console.error(err);

		if (exists) {
			return;
		}

		minioClient.makeBucket("archtika", "us-east-1", (err) => {
			if (err) return console.error(err);
		});
	});

	fastify.decorate("minio", {
		client: minioClient,
	});
}

export default fastifyPlugin(minio);
