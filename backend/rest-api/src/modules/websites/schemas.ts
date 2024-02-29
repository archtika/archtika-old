import { Static, Type, Optional } from '@sinclair/typebox'

export const createWebsiteSchema = Type.Object({
    title: Type.String({ minLength: 5, maxLength: 50 }),
    meta_description: Type.Optional(Type.String({ maxLength: 200 }))
})

export type CreateWebsiteSchemaType = Static<typeof createWebsiteSchema>
