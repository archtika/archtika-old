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
    UpdateWebsiteParamsSchemaType
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
}

export async function getWebsiteById(
    req: FastifyRequest,
    reply: FastifyReply
) {}

export async function updateWebsiteById(
    req: FastifyRequest<{
        Params: UpdateWebsiteParamsSchemaType
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

    await updateWebsiteQuery.run(
        {
            title,
            metaDescription,
            id,
            userId: req.user.id
        },
        req.server.pg.pool
    )

    console.log('update website by id')
}

export async function deleteWebsite(req: FastifyRequest, reply: FastifyReply) {
    console.log('delete website')
}

export async function getAllWebsites(req: FastifyRequest, reply: FastifyReply) {
    console.log('get all website')
}
