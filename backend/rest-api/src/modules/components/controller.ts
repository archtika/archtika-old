import { FastifyRequest, FastifyReply } from 'fastify'
import {
    ComponentSingleParamsSchemaType,
    CreateComponentSchemaType,
    ComponentParamsSchemaType,
    UpdateComponentSchemaType
} from './schemas.js'
import {
    createComponentQuery,
    findComponentByIdQuery,
    updateComponentQuery
} from './queries.js'

export async function createComponent(
    req: FastifyRequest<{
        Params: ComponentSingleParamsSchemaType
        Body: CreateComponentSchemaType
    }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { type, content } = req.body
    const { id } = req.params

    let assetId

    if (type === 'image' || type === 'video' || type === 'audio') {
        assetId = req.body.assetId
    }

    await createComponentQuery.run(
        {
            component: {
                type,
                pageId: id,
                content,
                assetId
            }
        },
        req.server.pg.pool
    )

    return reply.send('Component created successfully')
}

export async function findComponentById(
    req: FastifyRequest<{ Params: ComponentParamsSchemaType }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { pageId, componentId } = req.params

    const component = (
        await findComponentByIdQuery.run(
            { pageId, componentId },
            req.server.pg.pool
        )
    )[0]

    if (!component) {
        return reply
            .status(404)
            .send({ message: 'Component not found for that page' })
    }

    return component
}

export async function updateComponentById(
    req: FastifyRequest<{
        Params: ComponentParamsSchemaType
        Body: UpdateComponentSchemaType
    }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { pageId, componentId } = req.params
    const { content, type } = req.body

    let assetId

    if (type === 'image' || type === 'video' || type === 'audio') {
        assetId = req.body.assetId
    }

    const component = (
        await findComponentByIdQuery.run(
            { pageId, componentId },
            req.server.pg.pool
        )
    )[0]

    if (!component) {
        return reply
            .status(404)
            .send({ message: 'Component not found for that page' })
    }

    await updateComponentQuery.run(
        {
            content,
            pageId,
            componentId,
            assetId
        },
        req.server.pg.pool
    )

    return reply.status(200).send({ message: 'Component updated' })
}
