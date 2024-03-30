import { FastifyReply, FastifyRequest } from 'fastify'
import { sql } from 'kysely'
import {
    CreateWebsiteSchemaType,
    UpdateWebsiteSchemaType,
    WebsiteParamsSchemaType
} from './websites-schemas.js'

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
            meta_description: metaDescription,
            last_modified_by: req.user?.id ?? ''
        })
        .returningAll()
        .executeTakeFirstOrThrow()

    return reply.status(201).send(website)
}

export async function getAllWebsites(req: FastifyRequest, reply: FastifyReply) {
    const allWebsites = await req.server.kysely.db
        .selectFrom('structure.website')
        .selectAll()
        .where('user_id', '=', req.user?.id ?? '')
        .execute()

    return reply.status(200).send(allWebsites)
}

export async function getWebsite(
    req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
    reply: FastifyReply
) {
    const { id } = req.params

    try {
        const website = await req.server.kysely.db
            .selectFrom('structure.website')
            .selectAll()
            .where(({ and, or, exists, selectFrom }) =>
                or([
                    and({ id, user_id: req.user?.id }),
                    exists(
                        selectFrom('collaboration.collaborator')
                            .where(
                                and({ user_id: req.user?.id, website_id: id })
                            )
                            .where('permission_level', '>=', 10)
                    )
                ])
            )
            .executeTakeFirstOrThrow()

        return reply.status(200).send(website)
    } catch (error) {
        return reply.notFound('Website not found or not allowed')
    }
}

export async function updateWebsite(
    req: FastifyRequest<{
        Params: WebsiteParamsSchemaType
        Body: UpdateWebsiteSchemaType
    }>,
    reply: FastifyReply
) {
    const { id } = req.params
    const { title, metaDescription } = req.body

    try {
        const website = await req.server.kysely.db
            .updateTable('structure.website')
            .set({
                title,
                meta_description: metaDescription,
                updated_at: sql`now()`,
                last_modified_by: req.user?.id
            })
            .where(({ or, and, exists, selectFrom }) =>
                or([
                    and({ id, user_id: req.user?.id }),
                    exists(
                        selectFrom('collaboration.collaborator')
                            .where(
                                and({ user_id: req.user?.id, website_id: id })
                            )
                            .where('permission_level', '>=', 30)
                    )
                ])
            )
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(200).send(website)
    } catch (error) {
        return reply.notFound('Website not found or not allowed')
    }
}

export async function deleteWebsite(
    req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
    reply: FastifyReply
) {
    const { id } = req.params

    try {
        const website = await req.server.kysely.db
            .deleteFrom('structure.website')
            .where(({ and }) => and({ id, user_id: req.user?.id }))
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(200).send(website)
    } catch (error) {
        return reply.notFound('Website not found or not allowed')
    }
}
