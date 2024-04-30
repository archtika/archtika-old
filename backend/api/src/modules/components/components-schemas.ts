import { type Static, Type } from "@sinclair/typebox";

export const singleParamsSchema = Type.Object({
	id: Type.String({ format: "uuid" }),
});

export type SingleParamsSchemaType = Static<typeof singleParamsSchema>;

export const paramsSchema = Type.Object({
	pageId: Type.String({ format: "uuid" }),
	componentId: Type.String({ format: "uuid" }),
});

export type ParamsSchemaType = Static<typeof paramsSchema>;

const createComponentTextSchema = Type.Object({
	type: Type.Literal("text"),
	content: Type.Object({
		textContent: Type.String({ minLength: 1 }),
	}),
});

const updateComponentTextSchema = Type.Object({
	type: Type.Literal("text"),
	content: Type.Object({
		textContent: Type.Optional(Type.String({ minLength: 1 })),
	}),
});

const createComponentImageSchema = Type.Object({
	type: Type.Literal("image"),
	content: Type.Object({
		altText: Type.Optional(Type.String({ minLength: 1 })),
	}),
	assetId: Type.String({ format: "uuid" }),
});

const updateComponentImageSchema = Type.Object({
	type: Type.Literal("image"),
	content: Type.Object({
		altText: Type.Optional(Type.String({ minLength: 1 })),
	}),
	assetId: Type.Optional(Type.String({ format: "uuid" })),
});

const createComponentVideoSchema = Type.Object({
	type: Type.Literal("video"),
	content: Type.Object({
		altText: Type.Optional(Type.String({ minLength: 1 })),
		isLooped: Type.Optional(Type.Boolean()),
	}),
	assetId: Type.String({ format: "uuid" }),
});

const updateComponentVideoSchema = Type.Object({
	type: Type.Literal("video"),
	content: Type.Object({
		altText: Type.Optional(Type.String({ minLength: 1 })),
		isLooped: Type.Optional(Type.Boolean()),
	}),
	assetId: Type.Optional(Type.String({ format: "uuid" })),
});

const createComponentAudioSchema = Type.Object({
	type: Type.Literal("audio"),
	content: Type.Object({
		altText: Type.Optional(Type.String({ minLength: 1 })),
		isLooped: Type.Optional(Type.Boolean()),
	}),
	assetId: Type.String({ format: "uuid" }),
});

const updateComponentAudioSchema = Type.Object({
	type: Type.Literal("audio"),
	content: Type.Object({
		altText: Type.Optional(Type.String({ minLength: 1 })),
		isLooped: Type.Optional(Type.Boolean()),
	}),
	assetId: Type.Optional(Type.String({ format: "uuid" })),
});

export const exampleComponentValues = {
	Text: {
		value: {
			type: "text",
			content: {
				textContent: "Hello, world!",
			},
		},
	},
	Image: {
		value: {
			type: "image",
			content: {
				altText: "An image of a cat",
			},
			assetId: "00000000-0000-0000-0000-000000000000",
		},
	},
	Video: {
		value: {
			type: "video",
			content: {
				altText: "A video of a cat",
				isLooped: true,
			},
			assetId: "00000000-0000-0000-0000-000000000000",
		},
	},
	Audio: {
		value: {
			type: "audio",
			content: {
				altText: "An audio of a cat",
				isLooped: true,
			},
			assetId: "00000000-0000-0000-0000-000000000000",
		},
	},
};

export const createComponentSchema = Type.Union(
	[
		createComponentTextSchema,
		createComponentImageSchema,
		createComponentVideoSchema,
		createComponentAudioSchema,
	],
	{
		"x-examples": exampleComponentValues,
	},
);

export type CreateComponentSchemaType = Static<typeof createComponentSchema>;

export const updateComponentSchema = Type.Union(
	[
		updateComponentTextSchema,
		updateComponentImageSchema,
		updateComponentVideoSchema,
		updateComponentAudioSchema,
	],
	{
		"x-examples": exampleComponentValues,
	},
);

export type UpdateComponentSchemaType = Static<typeof updateComponentSchema>;

export const componentPositionSchema = Type.Object({
	row_start: Type.Integer({ minimum: 0 }),
	col_start: Type.Integer({ minimum: 0 }),
	row_end: Type.Integer({ minimum: 0 }),
	col_end: Type.Integer({ minimum: 0 }),
	row_end_span: Type.Integer({ minimum: 0 }),
	col_end_span: Type.Integer({ minimum: 0 }),
});

export type ComponentPositionSchemaType = Static<
	typeof componentPositionSchema
>;
