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

    await req.server.kysely.db
        .insertInto('structure.page')
        .values({
            website_id: websiteId,
            route: `/${route}`,
            title,
            meta_description: metaDescription
        })
        .execute()

    return reply.status(201).send({ message: 'Page created' })
}

export async function getPageById(
    req: FastifyRequest<{ Params: PageParamsSchemaType }>,
    reply: FastifyReply
) {
    const { pageId, websiteId } = req.params

    const page = await req.server.kysely.db
        .selectFrom('structure.page')
        .selectAll()
        .where((eb) => eb.and({ id: pageId, website_id: websiteId }))
        .executeTakeFirst()

    if (!page) {
        return reply
            .status(404)
            .send({ message: 'Page not found for that website' })
    }

    return page
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

    const page = await req.server.kysely.db
        .selectFrom('structure.page')
        .selectAll()
        .where((eb) => eb.and({ id: pageId, website_id: websiteId }))
        .executeTakeFirst()

    if (!page) {
        return reply
            .status(404)
            .send({ message: 'Page not found for that website' })
    }

    await req.server.kysely.db
        .updateTable('structure.page')
        .set({ route: `/${route}`, title, meta_description: metaDescription })
        .where((eb) => eb.and({ id: pageId, website_id: websiteId }))
        .execute()

    return reply.status(200).send({ message: 'Page updated' })
}

export async function deletePage(
    req: FastifyRequest<{ Params: PageParamsSchemaType }>,
    reply: FastifyReply
) {
    const { pageId, websiteId } = req.params

    const page = await req.server.kysely.db
        .selectFrom('structure.page')
        .selectAll()
        .where((eb) => eb.and({ id: pageId, website_id: websiteId }))
        .executeTakeFirst()

    if (!page) {
        return reply
            .status(404)
            .send({ message: 'Page not found for that website' })
    }

    await req.server.kysely.db
        .deleteFrom('structure.page')
        .where((eb) => eb.and({ id: pageId, website_id: websiteId }))
        .execute()

    return reply.status(200).send({ message: 'Page deleted' })
}

export async function getAllPages(
    req: FastifyRequest<{ Params: SinglePageParamsSchemaType }>,
    reply: FastifyReply
) {
    const { websiteId } = req.params

    const website = await req.server.kysely.db
        .selectFrom('structure.website')
        .selectAll()
        .where((eb) => eb.and({ id: websiteId, user_id: req.user?.id }))
        .executeTakeFirst()

    if (!website) {
        return reply.status(404).send({ message: 'Website not found' })
    }

    const allPages = await req.server.kysely.db
        .selectFrom('structure.page')
        .selectAll()
        .where((eb) => eb.and({ website_id: websiteId }))
        .execute()

    return allPages
}
