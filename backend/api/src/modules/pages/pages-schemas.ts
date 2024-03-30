import { Static, Type } from '@sinclair/typebox'

export const singlePageParamsSchema = Type.Object({
    id: Type.String({ minLength: 36, maxLength: 36 })
})

export type SinglePageParamsSchemaType = Static<typeof singlePageParamsSchema>

export const pageParamsSchema = Type.Object({
    pageId: Type.String({ minLength: 36, maxLength: 36 }),
    websiteId: Type.String({ minLength: 36, maxLength: 36 })
})

export type PageParamsSchemaType = Static<typeof pageParamsSchema>

export const createPageSchema = Type.Object({
    route: Type.String({ minLength: 5 }),
    title: Type.Optional(Type.String({ minLength: 5, maxLength: 50 })),
    metaDescription: Type.Optional(Type.String({ maxLength: 200 }))
})

export type CreatePageSchemaType = Static<typeof createPageSchema>

export const updatePageSchema = Type.Object({
    route: Type.Optional(Type.String({ minLength: 5 })),
    title: Type.Optional(Type.String({ minLength: 5, maxLength: 50 })),
    metaDescription: Type.Optional(Type.String({ maxLength: 200 }))
})

export type UpdatePageSchemaType = Static<typeof updatePageSchema>
