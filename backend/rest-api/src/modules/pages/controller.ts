import { findWebsiteByIdQuery } from '../websites/queries.js'
import {
    findAllPagesQuery,
    findPageByIdQuery,
    updatePageQuery,
    deletePageQuery,
    createPageQuery
} from './queries.js'
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
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { websiteId } = req.params
    const { route, title, metaDescription } = req.body

    await createPageQuery.run(
        {
            page: {
                websiteId,
                route: `/${route}`,
                title,
                metaDescription
            }
        },
        req.server.pg.pool
    )

    return reply.status(201).send({ message: 'Page created' })
}

export async function getPageById(
    req: FastifyRequest<{ Params: PageParamsSchemaType }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { pageId, websiteId } = req.params

    const page = (
        await findPageByIdQuery.run(
            { id: pageId, websiteId },
            req.server.pg.pool
        )
    )[0]

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
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { pageId, websiteId } = req.params
    const { route, title, metaDescription } = req.body

    const page = (
        await findPageByIdQuery.run(
            { id: pageId, websiteId },
            req.server.pg.pool
        )
    )[0]

    if (!page) {
        return reply
            .status(404)
            .send({ message: 'Page not found for that website' })
    }

    await updatePageQuery.run(
        { route, title, metaDescription, id: pageId, websiteId },
        req.server.pg.pool
    )

    return reply.status(200).send({ message: 'Page updated' })
}

export async function deletePage(
    req: FastifyRequest<{ Params: PageParamsSchemaType }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { pageId, websiteId } = req.params

    const page = (
        await findPageByIdQuery.run(
            { id: pageId, websiteId },
            req.server.pg.pool
        )
    )[0]

    if (!page) {
        return reply
            .status(404)
            .send({ message: 'Page not found for that website' })
    }

    await deletePageQuery.run(
        {
            id: pageId,
            websiteId
        },
        req.server.pg.pool
    )

    return reply.status(200).send({ message: 'Page deleted' })
}

export async function getAllPages(
    req: FastifyRequest<{ Params: SinglePageParamsSchemaType }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { websiteId } = req.params

    const website = (
        await findWebsiteByIdQuery.run(
            { id: websiteId, userId: req.user.id },
            req.server.pg.pool
        )
    )[0]

    if (!website) {
        return reply.status(404).send({ message: 'Website not found' })
    }

    const allPages = await findAllPagesQuery.run(
        { websiteId },
        req.server.pg.pool
    )

    return allPages
}
