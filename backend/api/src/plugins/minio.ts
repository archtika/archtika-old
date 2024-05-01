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

	try {
		const exists = await minioClient.bucketExists("archtika");

		if (!exists) {
			await minioClient.makeBucket("archtika", "us-east-1");
			console.log("Bucket created successfully");
		}
	} catch (err) {
		console.error(err);
	}

	fastify.decorate("minio", {
		client: minioClient,
	});
}

export default fastifyPlugin(minio);
