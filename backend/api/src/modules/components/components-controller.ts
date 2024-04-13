import { FastifyReply, FastifyRequest } from 'fastify'
import { sql } from 'kysely'
import {
    ComponentPositionSchemaType,
    CreateComponentSchemaType,
    ParamsSchemaType,
    SingleParamsSchemaType,
    UpdateComponentSchemaType
} from './components-schemas.js'
import WebSocket from 'ws'
import { mimeTypes } from '../../utils/mimetypes.js'

export async function createComponent(
    req: FastifyRequest<{
        Params: SingleParamsSchemaType
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

    try {
        const component = await req.server.kysely.db
            .transaction()
            .execute(async (trx) => {
                await trx
                    .updateTable('structure.website')
                    .set({
                        last_modified_by: req.user?.id
                    })
                    .returningAll()
                    .executeTakeFirstOrThrow()

                return await trx
                    .insertInto('components.component')
                    .values(({ selectFrom }) => ({
                        page_id: selectFrom('structure.page')
                            .select('id')
                            .where('id', '=', id)
                            .where(({ or, exists, ref }) =>
                                or([
                                    exists(
                                        selectFrom('structure.website').where(
                                            ({ and }) =>
                                                and({
                                                    id: ref(
                                                        'structure.page.website_id'
                                                    ),
                                                    user_id: req.user?.id
                                                })
                                        )
                                    ),
                                    exists(
                                        selectFrom('collaboration.collaborator')
                                            .where(({ and }) =>
                                                and({
                                                    website_id: ref(
                                                        'structure.page.website_id'
                                                    ),
                                                    user_id: req.user?.id
                                                })
                                            )
                                            .where('permission_level', '>=', 20)
                                    )
                                ])
                            ),
                        type,
                        content: JSON.stringify(content),
                        ...(assetId
                            ? {
                                  asset_id: selectFrom('media.media_asset')
                                      .select('media.media_asset.id')
                                      .where(
                                          'media.media_asset.id',
                                          '=',
                                          assetId
                                      )
                                      .where(
                                          'media.media_asset.mimetype',
                                          'in',
                                          mimeTypes[
                                              type as keyof typeof mimeTypes
                                          ]
                                      )
                              }
                            : {})
                    }))
                    .returningAll()
                    .executeTakeFirstOrThrow()
            })

        return reply.status(201).send(component)
    } catch (error) {
        return reply.notFound('Page not found or not allowed')
    }
}

export async function getAllComponents(
    req: FastifyRequest<{ Params: SingleParamsSchemaType }>,
    reply: FastifyReply
) {
    const { id } = req.params

    const allComponents = await req.server.kysely.db
        .selectFrom('components.component')
        .selectAll()
        .where('page_id', '=', id)
        .where(({ or, exists, selectFrom }) =>
            or([
                exists(
                    selectFrom('structure.website').where(({ and }) =>
                        and({
                            id: selectFrom('structure.page')
                                .select('website_id')
                                .where('id', '=', id),
                            user_id: req.user?.id
                        })
                    )
                ),
                exists(
                    selectFrom('collaboration.collaborator')
                        .where(({ and }) =>
                            and({
                                website_id: selectFrom('structure.page')
                                    .select('website_id')
                                    .where('id', '=', id),
                                user_id: req.user?.id
                            })
                        )
                        .where('permission_level', '>=', 10)
                )
            ])
        )
        .execute()

    if (!allComponents.length) {
        try {
            await req.server.kysely.db
                .selectFrom('structure.page')
                .select('id')
                .where('id', '=', id)
                .where(({ or, exists, selectFrom, ref }) =>
                    or([
                        exists(
                            selectFrom('structure.website').where(({ and }) =>
                                and({
                                    id: ref('structure.page.website_id'),
                                    user_id: req.user?.id
                                })
                            )
                        ),
                        exists(
                            selectFrom('collaboration.collaborator')
                                .where(({ and }) =>
                                    and({
                                        website_id: ref(
                                            'structure.page.website_id'
                                        ),
                                        user_id: req.user?.id
                                    })
                                )
                                .where('permission_level', '>=', 10)
                        )
                    ])
                )
                .executeTakeFirstOrThrow()
        } catch (error) {
            return reply.notFound('Page not found or not allowed')
        }
    }

    return reply.status(200).send(allComponents)
}

export async function getAllComponentsWebsocket(
    socket: WebSocket,
    req: FastifyRequest<{ Params: SingleParamsSchemaType }>
) {
    const { id } = req.params

    const channelName = `components_${id}`

    socket.on('message', (message) => {
        req.server.redis.pub.publish(channelName, message.toString())
    })

    req.server.redis.sub.subscribe(channelName, (err) => {
        if (err) {
            console.error(`Error subscribing to ${channelName}: ${err.message}`)
        }
    })

    req.server.redis.sub.on('message', (channel, message) => {
        if (channel === channelName) {
            req.server.websocketServer.clients.forEach((client) =>
                client.send(message)
            )
        }
    })

    socket.on('close', () => {
        req.server.redis.sub.unsubscribe()
        req.server.redis.sub.quit()
        req.server.redis.pub.quit()
    })
}

export async function getComponent(
    req: FastifyRequest<{ Params: ParamsSchemaType }>,
    reply: FastifyReply
) {
    const { pageId, componentId } = req.params

    try {
        const component = await req.server.kysely.db
            .selectFrom('components.component')
            .selectAll()
            .where(({ and }) =>
                and({
                    page_id: pageId,
                    id: componentId
                })
            )
            .where(({ or, exists, selectFrom }) =>
                or([
                    exists(
                        selectFrom('structure.website').where(({ and }) =>
                            and({
                                id: selectFrom('structure.page')
                                    .select('website_id')
                                    .where('id', '=', pageId),
                                user_id: req.user?.id
                            })
                        )
                    ),
                    exists(
                        selectFrom('collaboration.collaborator')
                            .where(({ and }) =>
                                and({
                                    website_id: selectFrom('structure.page')
                                        .select('website_id')
                                        .where('id', '=', pageId),
                                    user_id: req.user?.id
                                })
                            )
                            .where('permission_level', '>=', 10)
                    )
                ])
            )
            .executeTakeFirstOrThrow()

        return reply.status(200).send(component)
    } catch (error) {
        return reply.notFound('Page not found or not allowed')
    }
}

export async function updateComponent(
    req: FastifyRequest<{
        Params: ParamsSchemaType
        Body: UpdateComponentSchemaType
    }>,
    reply: FastifyReply
) {
    const { pageId, componentId } = req.params
    const { content, type } = req.body

    let assetId: string | undefined

    if (type === 'image' || type === 'video' || type === 'audio') {
        assetId = req.body.assetId
    }

    try {
        const component = await req.server.kysely.db
            .transaction()
            .execute(async (trx) => {
                await trx
                    .updateTable('structure.website')
                    .set({
                        last_modified_by: req.user?.id
                    })
                    .returningAll()
                    .executeTakeFirstOrThrow()

                return await trx
                    .updateTable('components.component')
                    .set({
                        content: JSON.stringify(content),
                        asset_id: assetId,
                        updated_at: sql`now()`
                    })
                    .where(({ and }) =>
                        and({
                            page_id: pageId,
                            id: componentId,
                            type
                        })
                    )
                    .where(({ or, exists, selectFrom }) =>
                        or([
                            exists(
                                selectFrom('structure.website').where(
                                    ({ and }) =>
                                        and({
                                            id: selectFrom('structure.page')
                                                .select('website_id')
                                                .where('id', '=', pageId),
                                            user_id: req.user?.id
                                        })
                                )
                            ),
                            exists(
                                selectFrom('collaboration.collaborator')
                                    .where(({ and }) =>
                                        and({
                                            website_id: selectFrom(
                                                'structure.page'
                                            )
                                                .select('website_id')
                                                .where('id', '=', pageId),
                                            user_id: req.user?.id
                                        })
                                    )
                                    .where('permission_level', '>=', 20)
                            )
                        ])
                    )
                    .returningAll()
                    .executeTakeFirstOrThrow()
            })

        return reply.status(200).send(component)
    } catch (error) {
        return reply.notFound(
            'Page not found or not allowed or invalid component type'
        )
    }
}

export async function deleteComponent(
    req: FastifyRequest<{
        Params: ParamsSchemaType
    }>,
    reply: FastifyReply
) {
    const { pageId, componentId } = req.params

    try {
        const component = await req.server.kysely.db
            .transaction()
            .execute(async (trx) => {
                await trx
                    .updateTable('structure.website')
                    .set({
                        last_modified_by: req.user?.id
                    })
                    .returningAll()
                    .executeTakeFirstOrThrow()

                return await trx
                    .deleteFrom('components.component')
                    .where(({ and }) =>
                        and({ page_id: pageId, id: componentId })
                    )
                    .where(({ or, exists, selectFrom }) =>
                        or([
                            exists(
                                selectFrom('structure.website').where(
                                    ({ and }) =>
                                        and({
                                            id: selectFrom('structure.page')
                                                .select('website_id')
                                                .where('id', '=', pageId),
                                            user_id: req.user?.id
                                        })
                                )
                            ),
                            exists(
                                selectFrom('collaboration.collaborator')
                                    .where(({ and }) =>
                                        and({
                                            website_id: selectFrom(
                                                'structure.page'
                                            )
                                                .select('website_id')
                                                .where('id', '=', pageId),
                                            user_id: req.user?.id
                                        })
                                    )
                                    .where('permission_level', '>=', 20)
                            )
                        ])
                    )
                    .returningAll()
                    .executeTakeFirstOrThrow()
            })

        return reply.status(200).send(component)
    } catch (error) {
        return reply.notFound('Page not found or not allowed')
    }
}

export async function setComponentPosition(
    req: FastifyRequest<{
        Params: SingleParamsSchemaType
        Body: ComponentPositionSchemaType
    }>,
    reply: FastifyReply
) {
    const { id } = req.params
    const { grid_x, grid_y, grid_width, grid_height } = req.body

    try {
        const componentPositon = await req.server.kysely.db
            .transaction()
            .execute(async (trx) => {
                await trx
                    .updateTable('structure.website')
                    .set({
                        last_modified_by: req.user?.id
                    })
                    .returningAll()
                    .executeTakeFirstOrThrow()

                return await trx
                    .insertInto('components.component_position')
                    .values(({ selectFrom }) => ({
                        component_id: selectFrom('components.component')
                            .select('id')
                            .where('id', '=', id)
                            .where(({ or, exists, ref }) =>
                                or([
                                    exists(
                                        selectFrom('structure.website').where(
                                            ({ and }) =>
                                                and({
                                                    id: selectFrom(
                                                        'structure.page'
                                                    )
                                                        .select('website_id')
                                                        .where(
                                                            'id',
                                                            '=',
                                                            ref(
                                                                'components.component.page_id'
                                                            )
                                                        ),
                                                    user_id: req.user?.id
                                                })
                                        )
                                    ),
                                    exists(
                                        selectFrom('collaboration.collaborator')
                                            .where(({ and }) =>
                                                and({
                                                    website_id: selectFrom(
                                                        'structure.page'
                                                    )
                                                        .select('website_id')
                                                        .where(
                                                            'id',
                                                            '=',
                                                            ref(
                                                                'components.component.page_id'
                                                            )
                                                        ),
                                                    user_id: req.user?.id
                                                })
                                            )
                                            .where('permission_level', '>=', 20)
                                    )
                                ])
                            ),
                        grid_x,
                        grid_y,
                        grid_width,
                        grid_height
                    }))
                    .returningAll()
                    .executeTakeFirstOrThrow()
            })

        return reply.status(201).send(componentPositon)
    } catch (error) {
        return reply.notFound('Component not found or not allowed')
    }
}

export async function updateComponentPosition(
    req: FastifyRequest<{
        Params: SingleParamsSchemaType
        Body: ComponentPositionSchemaType
    }>,
    reply: FastifyReply
) {
    const { id } = req.params
    const { grid_x, grid_y, grid_width, grid_height } = req.body

    try {
        const componentPosition = await req.server.kysely.db
            .transaction()
            .execute(async (trx) => {
                await trx
                    .updateTable('structure.website')
                    .set({
                        last_modified_by: req.user?.id
                    })
                    .returningAll()
                    .executeTakeFirstOrThrow()

                return await trx
                    .updateTable('components.component_position')
                    .set({
                        component_id: id,
                        grid_x,
                        grid_y,
                        grid_width,
                        grid_height
                    })
                    .where('component_id', '=', id)
                    .where(({ or, exists, selectFrom }) =>
                        or([
                            exists(
                                selectFrom('structure.website').where(
                                    ({ and }) =>
                                        and({
                                            id: selectFrom('structure.page')
                                                .select('website_id')
                                                .where(
                                                    'id',
                                                    '=',
                                                    selectFrom(
                                                        'components.component'
                                                    )
                                                        .select('page_id')
                                                        .where('id', '=', id)
                                                ),
                                            user_id: req.user?.id
                                        })
                                )
                            ),
                            exists(
                                selectFrom('collaboration.collaborator')
                                    .where(({ and }) =>
                                        and({
                                            website_id: selectFrom(
                                                'structure.page'
                                            )
                                                .select('website_id')
                                                .where(
                                                    'id',
                                                    '=',
                                                    selectFrom(
                                                        'components.component'
                                                    )
                                                        .select('page_id')
                                                        .where('id', '=', id)
                                                ),
                                            user_id: req.user?.id
                                        })
                                    )
                                    .where('permission_level', '>=', 20)
                            )
                        ])
                    )
                    .returningAll()
                    .executeTakeFirstOrThrow()
            })

        return reply.status(200).send(componentPosition)
    } catch (error) {
        return reply.notFound('Component not found or not allowed')
    }
}
