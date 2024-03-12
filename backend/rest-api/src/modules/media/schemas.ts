import { Type, Static } from '@sinclair/typebox'

enum AssetType {
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio'
}

export const multipartFile = Type.Object({
    filename: Type.String(),
    mimetype: Type.String(),
    toBuffer: Type.Function([], Type.Promise(Type.Uint8Array()))
})

export type multipartFileType = Static<typeof multipartFile>

export const deleteMediaParamsSchema = Type.Object({
    id: Type.String()
})

export type DeleteMediaParamsSchemaType = Static<typeof deleteMediaParamsSchema>
