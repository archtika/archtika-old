import { type Static, Type } from "@sinclair/typebox";

export const paramsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export type ParamsSchemaType = Static<typeof paramsSchema>;

export const downloadParamsSchema = Type.Object({
  websiteId: Type.String({ format: "uuid" }),
  generation: Type.Integer({ minimum: 1 }),
});

export type DownloadParamsSchemaType = Static<typeof downloadParamsSchema>;
