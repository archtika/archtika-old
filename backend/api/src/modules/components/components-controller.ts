import type { FastifyReply, FastifyRequest } from "fastify";
import { sql } from "kysely";
import type WebSocket from "ws";
import { mimeTypes } from "../../utils/mimetypes.js";
import {
	getExistingPresignedUrl,
	updateLastModifiedByColumn,
} from "../../utils/queries.js";
import type {
	ComponentPositionSchemaType,
	CreateComponentSchemaType,
	ParamsSchemaType,
	SingleParamsSchemaType,
	UpdateComponentSchemaType,
} from "./components-schemas.js";

export async function createComponent(
	req: FastifyRequest<{
		Params: SingleParamsSchemaType;
		Body: CreateComponentSchemaType;
	}>,
	reply: FastifyReply,
) {
	const { type, content } = req.body;
	const { id } = req.params;

	let assetId: string;
	let isPublic = false;

	if (type === "image" || type === "video" || type === "audio") {
		assetId = req.body.assetId;
	}

	if (type === "header" || type === "footer") {
		isPublic = true;
	}

	try {
		const component = await req.server.kysely.db
			.transaction()
			.execute(async (trx) => {
				updateLastModifiedByColumn(req, trx);

				return await trx
					.insertInto("components.component")
					.values(({ selectFrom }) => ({
						page_id: selectFrom("structure.page")
							.select("id")
							.where("id", "=", id)
							.where(({ or, exists, ref }) =>
								or([
									exists(
										selectFrom("structure.website").where(({ and }) =>
											and({
												id: ref("structure.page.website_id"),
												user_id: req.user?.id,
											}),
										),
									),
									exists(
										selectFrom("collaboration.collaborator")
											.where(({ and }) =>
												and({
													website_id: ref("structure.page.website_id"),
													user_id: req.user?.id,
												}),
											)
											.where("permission_level", ">=", 20),
									),
								]),
							),
						type,
						content: JSON.stringify(content),
						...(assetId
							? {
									asset_id: selectFrom("media.media_asset")
										.select("media.media_asset.id")
										.where("media.media_asset.id", "=", assetId)
										.where(
											"media.media_asset.mimetype",
											"in",
											mimeTypes[type as keyof typeof mimeTypes],
										),
								}
							: {}),
						is_public: isPublic,
						parent_id: req.body.parent_id,
					}))
					.returningAll()
					.executeTakeFirstOrThrow();
			});

		const componentWithUrl = {
			...component,
			url: await getExistingPresignedUrl(req, component.asset_id),
		};

		await req.server.redis.pub.publish(
			`components_${id}`,
			JSON.stringify({
				operation_type: "create",
				data: componentWithUrl,
				senderId: req.user?.id,
			}),
		);

		return reply.status(201).send(componentWithUrl);
	} catch (error) {
		return reply.notFound("Page not found or not allowed");
	}
}

export async function getAllComponents(
	req: FastifyRequest<{ Params: SingleParamsSchemaType }>,
	reply: FastifyReply,
) {
	const { id } = req.params;

	const allComponents = await req.server.kysely.db
		.selectFrom("components.component")
		.innerJoin(
			"components.component_position",
			"components.component.id",
			"components.component_position.component_id",
		)
		.selectAll("components.component")
		.select([
			"components.component_position.row_start",
			"components.component_position.col_start",
			"components.component_position.row_end",
			"components.component_position.col_end",
			"components.component_position.row_end_span",
			"components.component_position.col_end_span",
		])
		.where("page_id", "=", id)
		.where(({ or, exists, selectFrom }) =>
			or([
				exists(
					selectFrom("structure.website").where(({ and }) =>
						and({
							id: selectFrom("structure.page")
								.select("website_id")
								.where("id", "=", id),
							user_id: req.user?.id,
						}),
					),
				),
				exists(
					selectFrom("collaboration.collaborator")
						.where(({ and }) =>
							and({
								website_id: selectFrom("structure.page")
									.select("website_id")
									.where("id", "=", id),
								user_id: req.user?.id,
							}),
						)
						.where("permission_level", ">=", 10),
				),
			]),
		)
		.execute();

	if (!allComponents.length) {
		try {
			await req.server.kysely.db
				.selectFrom("structure.page")
				.select("id")
				.where("id", "=", id)
				.where(({ or, exists, selectFrom, ref }) =>
					or([
						exists(
							selectFrom("structure.website").where(({ and }) =>
								and({
									id: ref("structure.page.website_id"),
									user_id: req.user?.id,
								}),
							),
						),
						exists(
							selectFrom("collaboration.collaborator")
								.where(({ and }) =>
									and({
										website_id: ref("structure.page.website_id"),
										user_id: req.user?.id,
									}),
								)
								.where("permission_level", ">=", 10),
						),
					]),
				)
				.executeTakeFirstOrThrow();
		} catch (error) {
			return reply.notFound("Page not found or not allowed");
		}
	}

	const componentsWithUrls = await Promise.all(
		allComponents.map(async (component) => {
			return {
				...component,
				url: await getExistingPresignedUrl(req, component.asset_id),
			};
		}),
	);

	return reply.status(200).send(componentsWithUrls);
}

export async function getAllComponentsWebsocket(
	socket: WebSocket,
	req: FastifyRequest<{ Params: SingleParamsSchemaType }>,
) {
	const { id } = req.params;

	const channelName = `components_${id}`;

	socket.on("message", async (message) => {
		await req.server.redis.pub.publish(channelName, message.toString());
	});

	for (const client of req.server.websocketServer.clients as Set<
		WebSocket & { id?: string }
	>) {
		if (!client.id) {
			client.id = req.user?.id;
		}
	}

	await req.server.redis.sub.subscribe(channelName, (err) => {
		if (err) {
			console.error(`Error subscribing to ${channelName}: ${err.message}`);
		}
	});

	req.server.redis.sub.on("message", (channel, message) => {
		if (channel === channelName) {
			for (const client of req.server.websocketServer.clients as Set<
				WebSocket & { id?: string }
			>) {
				if (
					client.readyState === 1 &&
					client.id !== JSON.parse(message).senderId
				) {
					client.send(message);
				}
			}
		}
	});
}

export async function getComponent(
	req: FastifyRequest<{ Params: ParamsSchemaType }>,
	reply: FastifyReply,
) {
	const { pageId, componentId } = req.params;

	try {
		const component = await req.server.kysely.db
			.selectFrom("components.component")
			.selectAll()
			.where(({ and }) =>
				and({
					page_id: pageId,
					id: componentId,
				}),
			)
			.where(({ or, exists, selectFrom }) =>
				or([
					exists(
						selectFrom("structure.website").where(({ and }) =>
							and({
								id: selectFrom("structure.page")
									.select("website_id")
									.where("id", "=", pageId),
								user_id: req.user?.id,
							}),
						),
					),
					exists(
						selectFrom("collaboration.collaborator")
							.where(({ and }) =>
								and({
									website_id: selectFrom("structure.page")
										.select("website_id")
										.where("id", "=", pageId),
									user_id: req.user?.id,
								}),
							)
							.where("permission_level", ">=", 10),
					),
				]),
			)
			.executeTakeFirstOrThrow();

		const componentWithUrl = {
			...component,
			url: await getExistingPresignedUrl(req, component.asset_id),
		};

		return reply.status(200).send(componentWithUrl);
	} catch (error) {
		return reply.notFound("Page not found or not allowed");
	}
}

export async function updateComponent(
	req: FastifyRequest<{
		Params: ParamsSchemaType;
		Body: UpdateComponentSchemaType;
	}>,
	reply: FastifyReply,
) {
	const { pageId, componentId } = req.params;
	const { content, type } = req.body;

	let assetId: string | undefined;

	if (type === "image" || type === "video" || type === "audio") {
		assetId = req.body.assetId;
	}

	try {
		const component = await req.server.kysely.db
			.transaction()
			.execute(async (trx) => {
				updateLastModifiedByColumn(req, trx);

				return await trx
					.updateTable("components.component")
					.set({
						content: JSON.stringify(content),
						asset_id: assetId,
						updated_at: sql`now()`,
					})
					.where(({ and }) =>
						and({
							page_id: pageId,
							id: componentId,
							type,
						}),
					)
					.where(({ or, exists, selectFrom }) =>
						or([
							exists(
								selectFrom("structure.website").where(({ and }) =>
									and({
										id: selectFrom("structure.page")
											.select("website_id")
											.where("id", "=", pageId),
										user_id: req.user?.id,
									}),
								),
							),
							exists(
								selectFrom("collaboration.collaborator")
									.where(({ and }) =>
										and({
											website_id: selectFrom("structure.page")
												.select("website_id")
												.where("id", "=", pageId),
											user_id: req.user?.id,
										}),
									)
									.where("permission_level", ">=", 20),
							),
						]),
					)
					.returningAll()
					.executeTakeFirstOrThrow();
			});

		const componentWithUrl = {
			...component,
			url: await getExistingPresignedUrl(req, component.asset_id),
		};

		await req.server.redis.pub.publish(
			`components_${pageId}`,
			JSON.stringify({
				operation_type: "update",
				data: componentWithUrl,
				senderId: req.user?.id,
			}),
		);

		return reply.status(200).send(componentWithUrl);
	} catch (error) {
		return reply.notFound(
			"Page not found or not allowed or invalid component type",
		);
	}
}

export async function deleteComponent(
	req: FastifyRequest<{
		Params: ParamsSchemaType;
	}>,
	reply: FastifyReply,
) {
	const { pageId, componentId } = req.params;

	try {
		const component = await req.server.kysely.db
			.transaction()
			.execute(async (trx) => {
				updateLastModifiedByColumn(req, trx);

				return await trx
					.deleteFrom("components.component")
					.where(({ and }) => and({ page_id: pageId, id: componentId }))
					.where(({ or, exists, selectFrom }) =>
						or([
							exists(
								selectFrom("structure.website").where(({ and }) =>
									and({
										id: selectFrom("structure.page")
											.select("website_id")
											.where("id", "=", pageId),
										user_id: req.user?.id,
									}),
								),
							),
							exists(
								selectFrom("collaboration.collaborator")
									.where(({ and }) =>
										and({
											website_id: selectFrom("structure.page")
												.select("website_id")
												.where("id", "=", pageId),
											user_id: req.user?.id,
										}),
									)
									.where("permission_level", ">=", 20),
							),
						]),
					)
					.returningAll()
					.executeTakeFirstOrThrow();
			});

		const componentWithUrl = {
			...component,
			url: await getExistingPresignedUrl(req, component.asset_id),
		};

		await req.server.redis.pub.publish(
			`components_${pageId}`,
			JSON.stringify({
				operation_type: "delete",
				data: componentWithUrl,
				senderId: req.user?.id,
			}),
		);

		return reply.status(200).send(componentWithUrl);
	} catch (error) {
		return reply.notFound("Page not found or not allowed");
	}
}

export async function setComponentPosition(
	req: FastifyRequest<{
		Params: SingleParamsSchemaType;
		Body: ComponentPositionSchemaType;
	}>,
	reply: FastifyReply,
) {
	const { id } = req.params;
	const { row_start, col_start, row_end, col_end, row_end_span, col_end_span } =
		req.body;

	try {
		const componentPositon = await req.server.kysely.db
			.transaction()
			.execute(async (trx) => {
				updateLastModifiedByColumn(req, trx);

				return await trx
					.insertInto("components.component_position")
					.values(({ selectFrom }) => ({
						component_id: selectFrom("components.component")
							.select("id")
							.where("id", "=", id)
							.where(({ or, exists, ref }) =>
								or([
									exists(
										selectFrom("structure.website").where(({ and }) =>
											and({
												id: selectFrom("structure.page")
													.select("website_id")
													.where(
														"id",
														"=",
														ref("components.component.page_id"),
													),
												user_id: req.user?.id,
											}),
										),
									),
									exists(
										selectFrom("collaboration.collaborator")
											.where(({ and }) =>
												and({
													website_id: selectFrom("structure.page")
														.select("website_id")
														.where(
															"id",
															"=",
															ref("components.component.page_id"),
														),
													user_id: req.user?.id,
												}),
											)
											.where("permission_level", ">=", 20),
									),
								]),
							),
						row_start,
						col_start,
						row_end,
						col_end,
						row_end_span,
						col_end_span,
					}))
					.returningAll()
					.executeTakeFirstOrThrow();
			});

		return reply.status(201).send(componentPositon);
	} catch (error) {
		return reply.notFound("Component not found or not allowed");
	}
}

export async function updateComponentPosition(
	req: FastifyRequest<{
		Params: SingleParamsSchemaType;
		Body: ComponentPositionSchemaType;
	}>,
	reply: FastifyReply,
) {
	const { id } = req.params;
	const { row_start, col_start, row_end, col_end, row_end_span, col_end_span } =
		req.body;

	try {
		const pageId = await req.server.kysely.db
			.selectFrom("components.component")
			.select("page_id")
			.where("id", "=", id)
			.executeTakeFirst();

		const componentPosition = await req.server.kysely.db
			.transaction()
			.execute(async (trx) => {
				updateLastModifiedByColumn(req, trx);

				return await trx
					.updateTable("components.component_position")
					.set({
						component_id: id,
						row_start,
						col_start,
						row_end,
						col_end,
						row_end_span,
						col_end_span,
					})
					.where("component_id", "=", id)
					.where(({ or, exists, selectFrom }) =>
						or([
							exists(
								selectFrom("structure.website").where(({ and }) =>
									and({
										id: selectFrom("structure.page")
											.select("website_id")
											.where("id", "=", pageId?.page_id ?? ""),
										user_id: req.user?.id,
									}),
								),
							),
							exists(
								selectFrom("collaboration.collaborator")
									.where(({ and }) =>
										and({
											website_id: selectFrom("structure.page")
												.select("website_id")
												.where("id", "=", pageId?.page_id ?? ""),
											user_id: req.user?.id,
										}),
									)
									.where("permission_level", ">=", 20),
							),
						]),
					)
					.returningAll()
					.executeTakeFirstOrThrow();
			});

		const { component_id, ...rest } = componentPosition;

		await req.server.redis.pub.publish(
			`components_${pageId?.page_id}`,
			JSON.stringify({
				operation_type: "update-position",
				data: { id: component_id, ...rest },
				senderId: req.user?.id,
			}),
		);

		return reply.status(200).send(componentPosition);
	} catch (error) {
		return reply.notFound("Component not found or not allowed");
	}
}
