import { FastifyRequest, FastifyReply } from 'fastify'
import {
    CreateWebsiteSchemaType,
    UpdateWebsiteSchemaType,
    WebsiteParamsSchemaType
} from './schemas.js'
import { DeleteResult, sql } from 'kysely'

export async function createWebsite(
    req: FastifyRequest<{ Body: CreateWebsiteSchemaType }>,
    reply: FastifyReply
) {
    const { title, metaDescription } = req.body

    const website = await req.server.kysely.db
        .insertInto('structure.website')
        .values({
            user_id: req.user?.id ?? '',
            title,
            meta_description: metaDescription
        })
        .returningAll()
        .executeTakeFirstOrThrow()

    return reply.status(201).send(website)
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
        .executeTakeFirstOrThrow()

    return reply.status(200).send(website)
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
        .updateTable('structure.website')
        .set({
            title,
            meta_description: metaDescription,
            updated_at: sql`now()`
        })
        .where((eb) => eb.and({ id, user_id: req.user?.id }))
        .returningAll()
        .executeTakeFirstOrThrow()

    return reply.status(200).send(website)
}

export async function deleteWebsite(
    req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
    reply: FastifyReply
) {
    const { id } = req.params

    const website = await req.server.kysely.db
        .deleteFrom('structure.website')
        .where((eb) => eb.and({ id, user_id: req.user?.id }))
        .returningAll()
        .executeTakeFirstOrThrow()

    return reply.status(200).send(website)
}

export async function getAllWebsites(req: FastifyRequest, reply: FastifyReply) {
    const allWebsites = await req.server.kysely.db
        .selectFrom('structure.website')
        .selectAll()
        .where('user_id', '=', req.user?.id ?? '')
        .execute()

    return allWebsites
}
