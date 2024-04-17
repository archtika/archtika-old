import { Static, Type } from '@sinclair/typebox'

export const singleParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' })
})

export type SingleParamsSchemaType = Static<typeof singleParamsSchema>

export const paramsSchema = Type.Object({
    websiteId: Type.String({ format: 'uuid' }),
    userId: Type.String({ format: 'uuid' })
})

export type ParamsSchemaType = Static<typeof paramsSchema>

export const collaboratorSchema = Type.Object({
    permissionLevel: Type.Union(
        [Type.Literal(10), Type.Literal(20), Type.Literal(30)],
        { default: 10 }
    )
})

export type CollaboratorSchemaType = Static<typeof collaboratorSchema>
