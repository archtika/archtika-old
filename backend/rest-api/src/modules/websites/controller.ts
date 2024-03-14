import { FastifyRequest, FastifyReply } from 'fastify'
import {
    CreateWebsiteSchemaType,
    UpdateWebsiteSchemaType,
    WebsiteParamsSchemaType
} from './schemas.js'

export async function createWebsite(
    req: FastifyRequest<{ Body: CreateWebsiteSchemaType }>,
    reply: FastifyReply
) {
    if (!req.user) {
        return reply.unauthorized()
    }

    const { title, metaDescription } = req.body

    await req.server.kysely.db
        .insertInto('structure.website')
        .values({
            user_id: req.user.id,
            title,
            meta_description: metaDescription
        })
        .execute()

    return reply.status(201)
}

export async function getWebsiteById(
    req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
    reply: FastifyReply
) {
    const { id } = req.params

    const website = await req.server.kysely.db
        .selectFrom('structure.website')
        .selectAll()
        .where((eb) => eb.and({ id, user_id: req.user?.id }))
        .executeTakeFirst()

    if (!website) {
        return reply.notFound()
    }

    return website
}

export async function updateWebsiteById(
    req: FastifyRequest<{
        Params: WebsiteParamsSchemaType
        Body: UpdateWebsiteSchemaType
    }>,
    reply: FastifyReply
) {
    const { id } = req.params
    const { title, metaDescription } = req.body

    const website = await req.server.kysely.db
        .selectFrom('structure.website')
        .selectAll()
        .where((eb) => eb.and({ id, user_id: req.user?.id }))
        .executeTakeFirst()

    if (!website) {
        return reply.notFound()
    }

    await req.server.kysely.db
        .updateTable('structure.website')
        .set({ title, meta_description: metaDescription })
        .where((eb) => eb.and({ id, user_id: req.user?.id }))
        .execute()

    return reply.status(200)
}

export async function deleteWebsite(
    req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
    reply: FastifyReply
) {
    const { id } = req.params

    const website = await req.server.kysely.db
        .selectFrom('structure.website')
        .selectAll()
        .where((eb) => eb.and({ id, user_id: req.user?.id }))
        .executeTakeFirst()

    if (!website) {
        return reply.notFound()
    }

    await req.server.kysely.db
        .deleteFrom('structure.website')
        .where((eb) => eb.and({ id, user_id: req.user?.id }))
        .execute()

    return reply.status(204)
}

export async function getAllWebsites(req: FastifyRequest, reply: FastifyReply) {
    if (!req.user) {
        return reply.unauthorized()
    }

    const allWebsites = await req.server.kysely.db
        .selectFrom('structure.website')
        .selectAll()
        .where('user_id', '=', req.user.id)
        .execute()

    return allWebsites
}
