import { FastifyRequest, FastifyReply } from 'fastify'
import {
    ComponentSingleParamsSchemaType,
    CreateComponentSchemaType,
    ComponentParamsSchemaType,
    UpdateComponentSchemaType
} from './schemas.js'

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

    await req.server.kysely.db
        .insertInto('components.component')
        .values({
            type,
            page_id: id,
            content: JSON.stringify(content),
            asset_id: assetId
        })
        .execute()

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

    const component = await req.server.kysely.db
        .selectFrom('components.component')
        .selectAll()
        .where((eb) => eb.and({ page_id: pageId, id: componentId }))
        .executeTakeFirst()

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

    const component = await req.server.kysely.db
        .selectFrom('components.component')
        .selectAll()
        .where((eb) => eb.and({ page_id: pageId, id: componentId }))
        .executeTakeFirst()

    if (!component) {
        return reply
            .status(404)
            .send({ message: 'Component not found for that page' })
    }

    await req.server.kysely.db
        .updateTable('components.component')
        .set({ content: JSON.stringify(content), asset_id: assetId })
        .where((eb) => eb.and({ page_id: pageId, id: componentId }))
        .execute()

    return reply.status(200).send({ message: 'Component updated' })
}

export async function deleteComponent(
    req: FastifyRequest<{
        Params: ComponentParamsSchemaType
    }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { pageId, componentId } = req.params

    const component = await req.server.kysely.db
        .selectFrom('components.component')
        .selectAll()
        .where((eb) => eb.and({ id: componentId, page_id: pageId }))
        .executeTakeFirst()

    if (!component) {
        return reply
            .status(404)
            .send({ message: 'Component not found for that page' })
    }

    await req.server.kysely.db
        .deleteFrom('components.component')
        .where((eb) => eb.and({ id: componentId, page_id: pageId }))
        .execute()

    return reply.status(200).send({ message: 'Component deleted' })
}

export async function getAllComponents(
    req: FastifyRequest<{ Params: ComponentSingleParamsSchemaType }>,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    if (!req.user) {
        return reply.status(401).send({ message: 'Unauthorized' })
    }

    const { id } = req.params

    const page = await req.server.kysely.db
        .selectFrom('structure.page')
        .selectAll()
        .where((eb) => eb.and({ id }))
        .executeTakeFirst()

    if (!page) {
        return reply.status(404).send({ message: 'Page not found' })
    }

    const allComponents = await req.server.kysely.db
        .selectFrom('components.component')
        .selectAll()
        .where((eb) => eb.and({ page_id: id }))
        .execute()

    return allComponents
}
