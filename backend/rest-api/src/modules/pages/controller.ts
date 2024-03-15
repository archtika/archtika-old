import {
    CreatePageSchemaType,
    UpdatePageSchemaType,
    PageParamsSchemaType,
    SinglePageParamsSchemaType
} from './schemas.js'
import { FastifyRequest, FastifyReply } from 'fastify'

export async function createPage(
    req: FastifyRequest<{
        Params: SinglePageParamsSchemaType
        Body: CreatePageSchemaType
    }>,
    reply: FastifyReply
) {
    const { websiteId } = req.params
    const { route, title = '', metaDescription } = req.body

    try {
        const page = await req.server.kysely.db
            .insertInto('structure.page')
            .values(({ selectFrom }) => ({
                website_id: selectFrom('structure.website')
                    .select('id')
                    .where((eb) =>
                        eb.and({ id: websiteId, user_id: req.user?.id })
                    ),
                route: `/${route}`,
                title,
                meta_description: metaDescription
            }))
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(201).send(page)
    } catch (error) {
        return reply.notFound('Website not found or not allowed')
    }
}

export async function getPageById(
    req: FastifyRequest<{ Params: PageParamsSchemaType }>,
    reply: FastifyReply
) {
    const { pageId, websiteId } = req.params

    try {
        const page = await req.server.kysely.db
            .selectFrom('structure.website')
            .innerJoin(
                'structure.page',
                'structure.website.id',
                'structure.page.website_id'
            )
            .selectAll(['structure.page'])
            .where((eb) =>
                eb.and({
                    'structure.website.id': websiteId,
                    'structure.website.user_id': req.user?.id,
                    'structure.page.id': pageId
                })
            )
            .executeTakeFirstOrThrow()

        return reply.status(200).send(page)
    } catch (error) {
        return reply.notFound('Page not found or not allowed')
    }
}

export async function updatePageById(
    req: FastifyRequest<{
        Params: PageParamsSchemaType
        Body: UpdatePageSchemaType
    }>,
    reply: FastifyReply
) {
    const { pageId, websiteId } = req.params
    const { route, title, metaDescription } = req.body

    try {
        const page = await req.server.kysely.db
            .updateTable('structure.page')
            .set({
                route: `/${route}`,
                title,
                meta_description: metaDescription
            })
            .where((eb) =>
                eb.exists(
                    eb
                        .selectFrom('structure.website')
                        .where(eb.and({ id: websiteId, user_id: req.user?.id }))
                )
            )
            .where('id', '=', pageId)
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(200).send(page)
    } catch (error) {
        return reply.notFound('Page not found or not allowed')
    }
}

export async function deletePage(
    req: FastifyRequest<{ Params: PageParamsSchemaType }>,
    reply: FastifyReply
) {
    const { pageId, websiteId } = req.params

    try {
        const page = await req.server.kysely.db
            .deleteFrom('structure.page')
            .where((eb) =>
                eb.exists(
                    eb
                        .selectFrom('structure.website')
                        .where(eb.and({ id: websiteId, user_id: req.user?.id }))
                )
            )
            .where((eb) => eb.and({ id: pageId, website_id: websiteId }))
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(200).send(page)
    } catch (error) {
        return reply.notFound('Page not found or not allowed')
    }
}

export async function getAllPages(
    req: FastifyRequest<{ Params: SinglePageParamsSchemaType }>,
    reply: FastifyReply
) {
    const { websiteId } = req.params

    const allPages = await req.server.kysely.db
        .selectFrom('structure.website')
        .innerJoin(
            'structure.page',
            'structure.website.id',
            'structure.page.website_id'
        )
        .selectAll(['structure.page'])
        .where((eb) =>
            eb.and({
                'structure.website.id': websiteId,
                'structure.website.user_id': req.user?.id
            })
        )
        .execute()

    if (!allPages.length) {
        try {
            await req.server.kysely.db
                .selectFrom('structure.website')
                .select('id')
                .where((eb) => eb.and({ id: websiteId, user_id: req.user?.id }))
                .executeTakeFirstOrThrow()
        } catch (error) {
            return reply.notFound('Website not found or not allowed')
        }
    }

    return reply.status(200).send(allPages)
}
