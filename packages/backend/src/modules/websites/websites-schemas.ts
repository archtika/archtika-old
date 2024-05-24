import { type Static, Type } from "@sinclair/typebox";

export const websiteParamsSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
});

export type WebsiteParamsSchemaType = Static<typeof websiteParamsSchema>;

export const createWebsiteSchema = Type.Object({
  title: Type.String({ minLength: 5, maxLength: 50 }),
  metaDescription: Type.Optional(
    Type.Union([Type.String({ minLength: 10, maxLength: 200 }), Type.Null()]),
  ),
});

export type CreateWebsiteSchemaType = Static<typeof createWebsiteSchema>;

export const getWebsitesQuerySchema = Type.Object({
  shared: Type.Optional(Type.Boolean({ default: false })),
});

export type GetWebsitesQuerySchemaType = Static<typeof getWebsitesQuerySchema>;

export const updateWebsiteSchema = Type.Object({
  title: Type.Optional(Type.String({ minLength: 5, maxLength: 50 })),
  metaDescription: Type.Optional(
    Type.Union([Type.String({ minLength: 10, maxLength: 200 }), Type.Null()]),
  ),
});

export type UpdateWebsiteSchemaType = Static<typeof updateWebsiteSchema>;
