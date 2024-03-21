import { Static, Type } from '@sinclair/typebox'

export const paramsSchema = Type.Object({
    id: Type.Integer({ minimum: 1 })
})

export type ParamsSchemaType = Static<typeof paramsSchema>
