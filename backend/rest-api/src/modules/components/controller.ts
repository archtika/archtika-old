import { FastifyRequest, FastifyReply } from 'fastify'
import {
    ComponentSingleParamsSchemaType,
    CreateComponentSchemaType,
    ComponentParamsSchemaType,
    UpdateComponentSchemaType,
    ComponentPositionSchemaType
} from './schemas.js'
import { sql } from 'kysely'

export async function createComponent(
    req: FastifyRequest<{
        Params: ComponentSingleParamsSchemaType
        Body: CreateComponentSchemaType
    }>,
    reply: FastifyReply
) {
    const { type, content } = req.body
    const { id } = req.params

    let assetId: string

    if (type === 'image' || type === 'video' || type === 'audio') {
        assetId = req.body.assetId
    }

    const mimeTypes = {
        image: ['image/jpeg', 'image/png', 'image/svg+xml'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg'],
        video: ['video/mp4', 'video/webm', 'video/ogg']
    }

    try {
        const component = await req.server.kysely.db
            .insertInto('components.component')
            .values((eb) => ({
                page_id: eb
                    .selectFrom('structure.page')
                    .innerJoin(
                        'structure.website',
                        'structure.website.id',
                        'structure.page.website_id'
                    )
                    .select('structure.page.id')
                    .where((eb) =>
                        eb.and({
                            'structure.page.id': id,
                            'structure.website.user_id': req.user?.id
                        })
                    ),
                type,
                content: JSON.stringify(content),
                ...(assetId
                    ? {
                          asset_id: eb
                              .selectFrom('media.media_asset')
                              .select('media.media_asset.id')
                              .where('media.media_asset.id', '=', assetId)
                              .where(
                                  'media.media_asset.mimetype',
                                  'in',
                                  mimeTypes[type as keyof typeof mimeTypes]
                              )
                      }
                    : {})
            }))
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(201).send(component)
    } catch (error) {
        return reply.notFound('Page not found or not allowed or invalid asset')
    }
}

export async function getComponentById(
    req: FastifyRequest<{ Params: ComponentParamsSchemaType }>,
    reply: FastifyReply
) {
    const { pageId, componentId } = req.params

    try {
        const component = await req.server.kysely.db
            .selectFrom('components.component')
            .innerJoin(
                'structure.page',
                'structure.page.id',
                'components.component.page_id'
            )
            .innerJoin(
                'structure.website',
                'structure.website.id',
                'structure.page.website_id'
            )
            .selectAll(['components.component'])
            .where((eb) =>
                eb.and({
                    'structure.page.id': pageId,
                    'structure.website.user_id': req.user?.id,
                    'components.component.id': componentId
                })
            )
            .executeTakeFirstOrThrow()

        return reply.status(200).send(component)
    } catch (error) {
        return reply.notFound('Page not found or not allowed')
    }
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

    try {
        const page = await req.server.kysely.db
            .updateTable('components.component')
            .set({
                content: JSON.stringify(content),
                asset_id: assetId,
                updated_at: sql`now()`
            })
            .where((eb) =>
                eb.exists(
                    eb.selectFrom('structure.website').where(
                        eb.and({
                            id: eb
                                .selectFrom('structure.page')
                                .select('website_id')
                                .where('id', '=', pageId),
                            user_id: req.user?.id
                        })
                    )
                )
            )
            .where((eb) =>
                eb.and({
                    id: componentId,
                    type
                })
            )
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(200).send(page)
    } catch (error) {
        return reply.notFound(
            'Page not found or not allowed or invalid component type'
        )
    }
}

export async function deleteComponent(
    req: FastifyRequest<{
        Params: ComponentParamsSchemaType
    }>,
    reply: FastifyReply
) {
    const { pageId, componentId } = req.params

    try {
        const page = await req.server.kysely.db
            .deleteFrom('components.component')
            .where((eb) =>
                eb.exists(
                    eb.selectFrom('structure.website').where(
                        eb.and({
                            id: eb
                                .selectFrom('structure.page')
                                .select('website_id')
                                .where('id', '=', pageId),
                            user_id: req.user?.id
                        })
                    )
                )
            )
            .where((eb) => eb.and({ id: componentId, page_id: pageId }))
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(200).send(page)
    } catch (error) {
        return reply.notFound('Page not found or not allowed')
    }
}

export async function getAllComponents(
    req: FastifyRequest<{ Params: ComponentSingleParamsSchemaType }>,
    reply: FastifyReply
) {
    const { id } = req.params

    const allComponents = await req.server.kysely.db
        .selectFrom('components.component')
        .innerJoin(
            'structure.page',
            'structure.page.id',
            'components.component.page_id'
        )
        .innerJoin(
            'structure.website',
            'structure.website.id',
            'structure.page.website_id'
        )
        .selectAll(['components.component'])
        .where((eb) =>
            eb.and({
                'structure.page.id': id,
                'structure.website.user_id': req.user?.id
            })
        )
        .execute()

    if (!allComponents.length) {
        try {
            await req.server.kysely.db
                .selectFrom('structure.page')
                .innerJoin(
                    'structure.website',
                    'structure.website.id',
                    'structure.page.website_id'
                )
                .select('structure.page.id')
                .where((eb) =>
                    eb.and({
                        'structure.page.id': id,
                        'structure.website.user_id': req.user?.id
                    })
                )
                .executeTakeFirstOrThrow()
        } catch (error) {
            return reply.notFound('Page not found or not allowed')
        }
    }

    return reply.status(200).send(allComponents)
}

export async function setComponentPosition(
    req: FastifyRequest<{
        Params: ComponentParamsSchemaType
        Body: ComponentPositionSchemaType
    }>,
    reply: FastifyReply
) {
    const { pageId, componentId } = req.params
    const { grid_x, grid_y, grid_width, grid_height } = req.body

    try {
        const componentPositon = await req.server.kysely.db
            .insertInto('components.component_position')
            .values(({ selectFrom }) => ({
                component_id: selectFrom('components.component')
                    .innerJoin(
                        'structure.page',
                        'structure.page.id',
                        'components.component.page_id'
                    )
                    .innerJoin(
                        'structure.website',
                        'structure.website.id',
                        'structure.page.website_id'
                    )
                    .select('components.component.id')
                    .where((eb) =>
                        eb.and({
                            'structure.page.id': pageId,
                            'structure.website.user_id': req.user?.id,
                            'components.component.id': componentId
                        })
                    ),
                grid_x,
                grid_y,
                grid_width,
                grid_height
            }))
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(201).send(componentPositon)
    } catch (error) {
        return reply.notFound('Component not found or not allowed')
    }
}

export async function updateComponentPosition(
    req: FastifyRequest<{
        Params: ComponentParamsSchemaType
        Body: ComponentPositionSchemaType
    }>,
    reply: FastifyReply
) {
    const { pageId, componentId } = req.params
    const { grid_x, grid_y, grid_width, grid_height } = req.body

    try {
        const componentPositon = await req.server.kysely.db
            .updateTable('components.component_position')
            .set(({ selectFrom }) => ({
                component_id: selectFrom('components.component')
                    .innerJoin(
                        'structure.page',
                        'structure.page.id',
                        'components.component.page_id'
                    )
                    .innerJoin(
                        'structure.website',
                        'structure.website.id',
                        'structure.page.website_id'
                    )
                    .select('components.component.id')
                    .where((eb) =>
                        eb.and({
                            'structure.page.id': pageId,
                            'structure.website.user_id': req.user?.id,
                            'components.component.id': componentId
                        })
                    ),
                grid_x,
                grid_y,
                grid_width,
                grid_height
            }))
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(201).send(componentPositon)
    } catch (error) {
        return reply.notFound('Component not found or not allowed')
    }
}
