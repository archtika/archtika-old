import { type Static, Type } from "@sinclair/typebox";

export const singlePageParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export type SinglePageParamsSchemaType = Static<typeof singlePageParamsSchema>;

export const pageParamsSchema = Type.Object({
  pageId: Type.String({ format: "uuid" }),
  websiteId: Type.String({ format: "uuid" }),
});

export type PageParamsSchemaType = Static<typeof pageParamsSchema>;

export const createPageSchema = Type.Object({
  route: Type.String({
    minLength: 1,
    maxLength: 200,
    pattern: "^/(|[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)$",
  }),
  title: Type.String({ minLength: 5, maxLength: 50 }),
  metaDescription: Type.Optional(
    Type.Union([Type.String({ minLength: 10, maxLength: 200 }), Type.Null()]),
  ),
});

export type CreatePageSchemaType = Static<typeof createPageSchema>;

export const updatePageSchema = Type.Object({
  route: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 200,
      pattern: "^/(|[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*)$",
    }),
  ),
  title: Type.String({ minLength: 5, maxLength: 50 }),
  metaDescription: Type.Optional(
    Type.Union([Type.String({ minLength: 10, maxLength: 200 }), Type.Null()]),
  ),
});

export type UpdatePageSchemaType = Static<typeof updatePageSchema>;
