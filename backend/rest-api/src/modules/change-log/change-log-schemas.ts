import { Static, Type } from '@sinclair/typebox'

export const paramsSchema = Type.Object({
    id: Type.String({ minLength: 36, maxLength: 36 })
})

export type ParamsSchemaType = Static<typeof paramsSchema>
