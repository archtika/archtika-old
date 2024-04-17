import { Static, Type } from '@sinclair/typebox'

export const multipartFileSchema = Type.Object({
    filename: Type.String(),
    mimetype: Type.String(),
    toBuffer: Type.Function([], Type.Promise(Type.Uint8Array()))
})

export type multipartFileSchemaType = Static<typeof multipartFileSchema>

export const createMediaAssociationSchema = Type.Object({
    assetId: Type.String({
        format: 'uuid',
        default: '00000000-0000-0000-0000-000000000000'
    }),
    pageId: Type.String({
        format: 'uuid',
        default: '00000000-0000-0000-0000-000000000000'
    })
})

export type CreateMediaAssociationSchemaType = Static<
    typeof createMediaAssociationSchema
>

export const getAllMediaQuerySchema = Type.Object({
    pageId: Type.Optional(Type.String({ format: 'uuid' }))
})

export type GetAllMediaQuerySchemaType = Static<typeof getAllMediaQuerySchema>

export const paramsSchema = Type.Object({
    id: Type.String({ format: 'uuid' })
})

export type ParamsSchemaType = Static<typeof paramsSchema>
