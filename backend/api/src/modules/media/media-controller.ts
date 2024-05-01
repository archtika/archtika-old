import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import type { FastifyReply, FastifyRequest } from "fastify";
import { mimeTypes } from "../../utils/mimetypes.js";
import type {
	ParamsSchemaType,
	multipartFileSchemaType,
} from "./media-schemas.js";

interface Asset {
	id: string;
	user_id: string;
	name: string;
	mimetype: string;
	file_hash: string;
	url?: string;
}

export async function createMedia(
	req: FastifyRequest<{
		Body: { file: multipartFileSchemaType };
	}>,
	reply: FastifyReply,
) {
	const data = req.body.file;

	const isMimetypeValid = Object.values(mimeTypes).some((types) =>
		types.includes(data.mimetype),
	);

	if (!isMimetypeValid) {
		return reply.badRequest("Invalid file type");
	}

	const bufferData = await data.toBuffer();
	const buffer = Buffer.from(bufferData);

	const randomId = randomUUID();

	let media: Asset;

	try {
		media = await req.server.kysely.db
			.insertInto("media.media_asset")
			.values({
				id: randomId,
				user_id: req.user?.id ?? "",
				name: path.parse(data.filename).name,
				mimetype: data.mimetype,
				file_hash: createHash("sha256").update(buffer).digest("hex"),
			})
			.onConflict((oc) => oc.constraint("uniqueFileHash").doNothing())
			.returningAll()
			.executeTakeFirstOrThrow();
	} catch (error) {
		return reply.conflict("File already exists");
	}

	const bucketName = "archtika";
	const objectName = randomId;

	try {
		await req.server.minio.client.putObject(
			bucketName,
			objectName,
			buffer,
			undefined,
			{
				"Content-Type": media.mimetype,
				"X-Amz-Meta-Original-Name": media.name,
				"X-Amz-Meta-File-Hash": media.file_hash,
			},
		);

		console.log("File uploaded successfully");
	} catch (err) {
		console.log(err);
		return reply.internalServerError("Error uploading file");
	}

	return reply.status(201).send(media);
}

export async function getAllMedia(req: FastifyRequest, reply: FastifyReply) {
	const media = await req.server.kysely.db
		.selectFrom("media.media_asset")
		.selectAll()
		.where("user_id", "=", req.user?.id ?? "")
		.execute();

	const assetsWithPresignedUrls = await Promise.all(
		media.map(async (asset) => {
			const presignedUrl = await req.server.minio.client.presignedGetObject(
				"archtika",
				`${asset.id}`,
			);
			return {
				...asset,
				url: presignedUrl,
			};
		}),
	);

	const groupedAssets = assetsWithPresignedUrls.reduce(
		(acc: Record<string, Asset[]>, asset) => {
			let type: "image" | "audio" | "video";
			if (asset.mimetype.startsWith("image/")) {
				type = "image";
			} else if (asset.mimetype.startsWith("audio/")) {
				type = "audio";
			} else if (asset.mimetype.startsWith("video/")) {
				type = "video";
			} else {
				throw new Error("Invalid mimetype");
			}

			if (!acc[type]) {
				acc[type] = [];
			}

			acc[type].push(asset);

			return acc;
		},
		{},
	);

	return reply.status(200).send(groupedAssets);
}

export async function getMedia(
	req: FastifyRequest<{ Params: ParamsSchemaType }>,
	reply: FastifyReply,
) {
	let media: Asset;

	const { id } = req.params;

	try {
		media = await req.server.kysely.db
			.selectFrom("media.media_asset")
			.selectAll()
			.where(({ and }) => and({ id, user_id: req.user?.id }))
			.executeTakeFirstOrThrow();
	} catch (error) {
		return reply.notFound("Media not found or not allowed");
	}

	const presignedUrl = await req.server.minio.client.presignedGetObject(
		"archtika",
		media.id,
	);

	const assetWithPresignedUrl = {
		...media,
		url: presignedUrl,
	};

	return reply.status(200).send(assetWithPresignedUrl);
}

export async function deleteMedia(
	req: FastifyRequest<{ Params: ParamsSchemaType }>,
	reply: FastifyReply,
) {
	let media: Asset;

	const { id } = req.params;

	try {
		media = await req.server.kysely.db
			.deleteFrom("media.media_asset")
			.where(({ and }) => and({ id, user_id: req.user?.id }))
			.returningAll()
			.executeTakeFirstOrThrow();
	} catch (error) {
		return reply.notFound("Media not found or not allowed");
	}

	try {
		await req.server.minio.client.removeObject("archtika", media.id);
	} catch (err) {
		console.error(err);
		return reply.internalServerError("Error deleting file");
	}

	return reply.status(200).send(media);
}
