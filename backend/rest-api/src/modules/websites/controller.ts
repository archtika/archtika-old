import { FastifyRequest, FastifyReply } from 'fastify'
import {
    findWebsiteByIdQuery,
    findAllWebsitesQuery,
    createWebsiteQuery,
    deleteWebsiteQuery,
    updateWebsiteQuery
} from './queries.js'
import { CreateWebsiteSchemaType } from './schemas.js'

export async function createWebsite(
    req: FastifyRequest<{ Body: CreateWebsiteSchemaType }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { title, meta_description } = req.body

    await createWebsiteQuery.run(
        {
            website: {
                userId: req.user.id,
                title,
                meta_description
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
    req: FastifyRequest,
    reply: FastifyReply
) {
    console.log('update website by id')
}

export async function deleteWebsite(req: FastifyRequest, reply: FastifyReply) {
    console.log('delete website')
}

export async function getAllWebsites(req: FastifyRequest, reply: FastifyReply) {
    console.log('get all website')
}
