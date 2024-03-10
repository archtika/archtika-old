import { Type, Static } from '@sinclair/typebox'

enum AssetType {
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio'
}

export const multipartFile = Type.Object({
    encoding: Type.String(),
    filename: Type.String(),
    limit: Type.Boolean(),
    mimetype: Type.String()
})
