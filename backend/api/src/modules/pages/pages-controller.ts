import { FastifyReply, FastifyRequest } from 'fastify'
import { sql } from 'kysely'
import {
    CreatePageSchemaType,
    PageParamsSchemaType,
    SinglePageParamsSchemaType,
    UpdatePageSchemaType
} from './pages-schemas.js'

export async function createPage(
    req: FastifyRequest<{
        Params: SinglePageParamsSchemaType
        Body: CreatePageSchemaType
    }>,
    reply: FastifyReply
) {
    const { id } = req.params
    const { route, title = '', metaDescription } = req.body

    try {
        const page = await req.server.kysely.db
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
                    .insertInto('structure.page')
                    .values(({ selectFrom, and, or, exists }) => ({
                        website_id: selectFrom('structure.website')
                            .select('id')
                            .where(
                                or([
                                    and({ id, user_id: req.user?.id }),
                                    exists(
                                        selectFrom('collaboration.collaborator')
                                            .where(
                                                and({
                                                    user_id: req.user?.id,
                                                    website_id: id
                                                })
                                            )
                                            .where('permission_level', '>=', 20)
                                    )
                                ])
                            ),
                        route: `/${route}`,
                        title,
                        meta_description: metaDescription
                    }))
                    .returningAll()
                    .executeTakeFirstOrThrow()
            })

        return reply.status(201).send(page)
    } catch (error) {
        return reply.notFound('Page not found or not allowed')
    }
}

export async function getAllPages(
    req: FastifyRequest<{ Params: SinglePageParamsSchemaType }>,
    reply: FastifyReply
) {
    const { id } = req.params

    const allPages = await req.server.kysely.db
        .selectFrom('structure.page')
        .selectAll()
        .where(({ or, and, exists, selectFrom }) =>
            or([
                exists(
                    selectFrom('structure.website').where(
                        and({ id, user_id: req.user?.id })
                    )
                ),
                exists(
                    selectFrom('collaboration.collaborator')
                        .where(
                            and({
                                user_id: req.user?.id,
                                website_id: id
                            })
                        )
                        .where('permission_level', '>=', 10)
                )
            ])
        )
        .where('website_id', '=', id)
        .execute()

    if (!allPages.length) {
        try {
            await req.server.kysely.db
                .selectFrom('structure.website')
                .select('id')
                .where(({ and, or, selectFrom, exists }) =>
                    or([
                        and({ id, user_id: req.user?.id }),
                        exists(
                            selectFrom('collaboration.collaborator')
                                .where(
                                    and({
                                        user_id: req.user?.id,
                                        website_id: id
                                    })
                                )
                                .where('permission_level', '>=', 10)
                        )
                    ])
                )
                .executeTakeFirstOrThrow()
        } catch (error) {
            return reply.notFound('Website not found or not allowed')
        }
    }

    return reply.status(200).send(allPages)
}

export async function getPage(
    req: FastifyRequest<{ Params: PageParamsSchemaType }>,
    reply: FastifyReply
) {
    const { pageId, websiteId } = req.params

    try {
        const page = await req.server.kysely.db
            .selectFrom('structure.page')
            .selectAll()
            .where(({ or, and, exists, selectFrom }) =>
                or([
                    exists(
                        selectFrom('structure.website').where(
                            and({ id: websiteId, user_id: req.user?.id })
                        )
                    ),
                    exists(
                        selectFrom('collaboration.collaborator')
                            .where(
                                and({
                                    user_id: req.user?.id,
                                    website_id: websiteId
                                })
                            )
                            .where('permission_level', '>=', 10)
                    )
                ])
            )
            .where('id', '=', pageId)
            .executeTakeFirstOrThrow()

        return reply.status(200).send(page)
    } catch (error) {
        return reply.notFound('Page not found or not allowed')
    }
}

export async function updatePage(
    req: FastifyRequest<{
        Params: PageParamsSchemaType
        Body: UpdatePageSchemaType
    }>,
    reply: FastifyReply
) {
    const { pageId, websiteId } = req.params
    const { route, title, metaDescription } = req.body

    try {
        const page = await req.server.kysely.db
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
                    .updateTable('structure.page')
                    .set({
                        ...(route ? { route: `/${route}` } : {}),
                        title,
                        meta_description: metaDescription,
                        updated_at: sql`now()`
                    })
                    .where(({ exists, and, selectFrom, or }) =>
                        or([
                            exists(
                                selectFrom('structure.website').where(
                                    and({
                                        id: websiteId,
                                        user_id: req.user?.id
                                    })
                                )
                            ),
                            exists(
                                selectFrom('collaboration.collaborator')
                                    .where(
                                        and({
                                            user_id: req.user?.id,
                                            website_id: websiteId
                                        })
                                    )
                                    .where('permission_level', '>=', 20)
                            )
                        ])
                    )
                    .where('id', '=', pageId)
                    .returningAll()
                    .executeTakeFirstOrThrow()
            })

        return reply.status(200).send(page)
    } catch (error) {
        return reply.notFound('Page not found or not allowed')
    }
}

export async function deletePage(
    req: FastifyRequest<{ Params: PageParamsSchemaType }>,
    reply: FastifyReply
) {
    const { pageId, websiteId } = req.params

    try {
        const page = await req.server.kysely.db
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
                    .deleteFrom('structure.page')
                    .where(({ exists, and, selectFrom, or }) =>
                        or([
                            exists(
                                selectFrom('structure.website').where(
                                    and({
                                        id: websiteId,
                                        user_id: req.user?.id
                                    })
                                )
                            ),
                            exists(
                                selectFrom('collaboration.collaborator')
                                    .where(
                                        and({
                                            user_id: req.user?.id,
                                            website_id: websiteId
                                        })
                                    )
                                    .where('permission_level', '>=', 20)
                            )
                        ])
                    )
                    .where(({ and }) =>
                        and({ id: pageId, website_id: websiteId })
                    )
                    .returningAll()
                    .executeTakeFirstOrThrow()
            })

        return reply.status(200).send(page)
    } catch (error) {
        return reply.notFound('Page not found or not allowed')
    }
}
