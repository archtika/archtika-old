import { Type, Static } from '@sinclair/typebox'

enum AssetType {
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio'
}

export const createMediaSchema = Type.Object(
    {
        asset_type: Type.Enum(AssetType),
        asset_name: Type.String(),
        asset_url: Type.String()
    },
    {
        additionalProperties: false
    }
)

export type CreateMediaSchemaType = Static<typeof createMediaSchema>
