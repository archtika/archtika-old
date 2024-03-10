import { Static, Type } from '@sinclair/typebox'

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

export const pageParamsSchema = Type.Object({
    pageId: Type.Integer({ minimum: 1 }),
    websiteId: Type.Integer({ minimum: 1 })
})

export type PageParamsSchemaType = Static<typeof pageParamsSchema>

export const singlePageParamsSchema = Type.Object({
    websiteId: Type.Integer({ minimum: 1 })
})

export type SinglePageParamsSchemaType = Static<typeof singlePageParamsSchema>