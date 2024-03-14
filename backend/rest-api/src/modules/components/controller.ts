import { FastifyRequest, FastifyReply } from 'fastify'
import {
    ComponentSingleParamsSchemaType,
    CreateComponentSchemaType,
    ComponentParamsSchemaType,
    UpdateComponentSchemaType,
    CreateComponentPositionSchemaType
} from './schemas.js'

export async function createComponent(
    req: FastifyRequest<{
        Params: ComponentSingleParamsSchemaType
        Body: CreateComponentSchemaType
    }>,
    reply: FastifyReply
) {
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

    return reply.status(201)
}

export async function findComponentById(
    req: FastifyRequest<{ Params: ComponentParamsSchemaType }>,
    reply: FastifyReply
) {
    const { pageId, componentId } = req.params

    const component = await req.server.kysely.db
        .selectFrom('components.component')
        .selectAll()
        .where((eb) => eb.and({ page_id: pageId, id: componentId }))
        .executeTakeFirst()

    if (!component) {
        return reply.notFound()
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
        return reply.notFound()
    }

    await req.server.kysely.db
        .updateTable('components.component')
        .set({ content: JSON.stringify(content), asset_id: assetId })
        .where((eb) => eb.and({ page_id: pageId, id: componentId }))
        .execute()

    return reply.status(200)
}

export async function deleteComponent(
    req: FastifyRequest<{
        Params: ComponentParamsSchemaType
    }>,
    reply: FastifyReply
) {
    const { pageId, componentId } = req.params

    const component = await req.server.kysely.db
        .selectFrom('components.component')
        .selectAll()
        .where((eb) => eb.and({ id: componentId, page_id: pageId }))
        .executeTakeFirst()

    if (!component) {
        return reply.notFound()
    }

    await req.server.kysely.db
        .deleteFrom('components.component')
        .where((eb) => eb.and({ id: componentId, page_id: pageId }))
        .execute()

    return reply.status(204)
}

export async function getAllComponents(
    req: FastifyRequest<{ Params: ComponentSingleParamsSchemaType }>,
    reply: FastifyReply
) {
    const { id } = req.params

    const page = await req.server.kysely.db
        .selectFrom('structure.page')
        .selectAll()
        .where((eb) => eb.and({ id }))
        .executeTakeFirst()

    if (!page) {
        return reply.notFound()
    }

    const allComponents = await req.server.kysely.db
        .selectFrom('components.component')
        .selectAll()
        .where((eb) => eb.and({ page_id: id }))
        .execute()

    return allComponents
}

export async function setComponentPosition(
    req: FastifyRequest<{
        Params: ComponentParamsSchemaType
        Body: CreateComponentPositionSchemaType
    }>,
    reply: FastifyReply
) {
    const { pageId, componentId } = req.params
    const { grid_x, grid_y, grid_width, grid_height } = req.body

    const component = await req.server.kysely.db
        .selectFrom('components.component')
        .selectAll()
        .where((eb) => eb.and({ page_id: pageId, id: componentId }))
        .executeTakeFirst()

    if (!component) {
        return reply.notFound()
    }

    await req.server.kysely.db
        .insertInto('components.component_position')
        .values({
            component_id: componentId,
            grid_x,
            grid_y,
            grid_width,
            grid_height
        })
        .execute()

    return reply.status(200)
}
