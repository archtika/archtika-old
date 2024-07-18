import cluster from "node:cluster";
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

  if (cluster.worker && cluster.worker.id === 1) {
    try {
      const buckets = ["media", "deployments"];

      for (const bucket of buckets) {
        const bucketExists = await minioClient.bucketExists(bucket);

        if (!bucketExists) {
          await minioClient.makeBucket(bucket, "us-east-1");

          console.log(`Bucket "${bucket}" created successfully`);

          if (bucket !== "media") return;

          const policy = {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Deny",
                Principal: "*",
                Action: "s3:ListBucket",
                Resource: `arn:aws:s3:::${bucket}`,
              },
              {
                Effect: "Allow",
                Principal: "*",
                Action: "s3:GetObject",
                Resource: `arn:aws:s3:::${bucket}/*`,
              },
            ],
          };

          await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  fastify.decorate("minio", {
    client: minioClient,
  });
}

export default fastifyPlugin(minio);
