import { Static, Type } from '@sinclair/typebox'

export const singleParamsSchema = Type.Object({
    id: Type.String({ minLength: 36, maxLength: 36 })
})

export type SingleParamsSchemaType = Static<typeof singleParamsSchema>

export const paramsSchema = Type.Object({
    websiteId: Type.String({ minLength: 36, maxLength: 36 }),
    userId: Type.String({ minLength: 20, maxLength: 20 })
})

export type ParamsSchemaType = Static<typeof paramsSchema>

export const collaboratorSchema = Type.Object({
    permissionLevel: Type.Integer({ default: 10 })
})

export type CollaboratorSchemaType = Static<typeof collaboratorSchema>
