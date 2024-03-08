import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateMediaSchemaType } from './schemas.js'

export async function createMedia(
    req: FastifyRequest<{
        Body: CreateMediaSchemaType
    }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { asset_type, asset_name, asset_url } = req.body

    await req.server.kysely.db
        .insertInto('media.media_asset')
        .values({
            user_id: req.user.id,
            asset_type,
            asset_name,
            asset_url
        })
        .execute()

    return reply.send('Component created successfully')
}
