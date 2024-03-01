import { FastifyRequest, FastifyReply } from 'fastify'
import {
    findWebsiteByIdQuery,
    findAllWebsitesQuery,
    createWebsiteQuery,
    deleteWebsiteQuery,
    updateWebsiteQuery
} from './queries.js'
import {
    CreateWebsiteSchemaType,
    UpdateWebsiteSchemaType,
    WebsiteParamsSchemaType
} from './schemas.js'

export async function createWebsite(
    req: FastifyRequest<{ Body: CreateWebsiteSchemaType }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { title, metaDescription } = req.body

    await createWebsiteQuery.run(
        {
            website: {
                userId: req.user.id,
                title,
                metaDescription
            }
        },
        req.server.pg.pool
    )

    return reply.status(201).send({ message: 'Website created' })
}

export async function getWebsiteById(
    req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { id } = req.params

    const website = (
        await findWebsiteByIdQuery.run(
            { id, userId: req.user.id },
            req.server.pg.pool
        )
    )[0]

    if (!website) {
        return reply.status(404).send({ message: 'Website not found' })
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
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { id } = req.params
    const { title, metaDescription } = req.body

    const website = (
        await findWebsiteByIdQuery.run(
            { id, userId: req.user.id },
            req.server.pg.pool
        )
    )[0]

    if (!website) {
        return reply.status(404).send({ message: 'Website not found' })
    }

    updateWebsiteQuery.run(
        {
            title,
            metaDescription,
            id,
            userId: req.user.id
        },
        req.server.pg.pool
    )

    return reply.status(200).send({ message: 'Website updated' })
}

export async function deleteWebsite(
    req: FastifyRequest<{ Params: WebsiteParamsSchemaType }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { id } = req.params

    const website = (
        await findWebsiteByIdQuery.run(
            { id, userId: req.user.id },
            req.server.pg.pool
        )
    )[0]

    if (!website) {
        return reply.status(404).send({ message: 'Website not found' })
    }

    await deleteWebsiteQuery.run(
        {
            id,
            userId: req.user.id
        },
        req.server.pg.pool
    )

    return reply.status(200).send({ message: 'Website deleted' })
}

export async function getAllWebsites(req: FastifyRequest, reply: FastifyReply) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const allWebsites = await findAllWebsitesQuery.run(
        { userId: req.user.id },
        req.server.pg.pool
    )

    return allWebsites
}
