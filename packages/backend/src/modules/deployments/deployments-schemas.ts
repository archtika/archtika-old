import { type Static, Type } from "@sinclair/typebox";

export const paramsSchema = Type.Object({
	id: Type.String({ format: "uuid" }),
});

export type ParamsSchemaType = Static<typeof paramsSchema>;
