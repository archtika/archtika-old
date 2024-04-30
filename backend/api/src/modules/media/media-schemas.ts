import { type Static, Type } from "@sinclair/typebox";

export const multipartFileSchema = Type.Object({
	filename: Type.String(),
	mimetype: Type.String(),
	toBuffer: Type.Function([], Type.Promise(Type.Uint8Array())),
});

export type multipartFileSchemaType = Static<typeof multipartFileSchema>;

export const paramsSchema = Type.Object({
	id: Type.String({ format: "uuid" }),
});

export type ParamsSchemaType = Static<typeof paramsSchema>;
