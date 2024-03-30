import { Static, Type } from '@sinclair/typebox'

export const websiteParamsSchema = Type.Object({
    id: Type.String({ minLength: 36, maxLength: 36 })
})

export type WebsiteParamsSchemaType = Static<typeof websiteParamsSchema>

export const createWebsiteSchema = Type.Object({
    title: Type.String({ minLength: 5, maxLength: 50 }),
    metaDescription: Type.Optional(Type.String({ maxLength: 200 }))
})

export type CreateWebsiteSchemaType = Static<typeof createWebsiteSchema>

export const updateWebsiteSchema = Type.Object({
    title: Type.Optional(Type.String({ minLength: 5, maxLength: 50 })),
    metaDescription: Type.Optional(Type.String({ maxLength: 200 }))
})

export type UpdateWebsiteSchemaType = Static<typeof updateWebsiteSchema>
