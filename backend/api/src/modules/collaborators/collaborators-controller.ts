import { FastifyReply, FastifyRequest } from 'fastify'
import {
    CollaboratorSchemaType,
    ParamsSchemaType,
    SingleParamsSchemaType
} from './collaborators-schemas.js'

export async function getAllCollaborators(
    req: FastifyRequest<{ Params: SingleParamsSchemaType }>,
    reply: FastifyReply
) {
    const { id } = req.params

    const collaborators = await req.server.kysely.db
        .selectFrom('collaboration.collaborator')
        .selectAll()
        .where(({ or, eb, and, exists, selectFrom }) =>
            or([
                and([
                    eb('website_id', '=', id),
                    exists(
                        selectFrom('structure.website').where(
                            and({ id, user_id: req.user?.id })
                        )
                    )
                ]),
                and([
                    eb('user_id', '=', req.user?.id ?? ''),
                    eb('website_id', '=', id),
                    eb('permission_level', '>=', 10)
                ])
            ])
        )
        .execute()

    if (!collaborators.length) {
        try {
            await req.server.kysely.db
                .selectFrom('structure.website')
                .select('id')
                .where(({ and }) => and({ id, user_id: req.user?.id }))
                .executeTakeFirstOrThrow()
        } catch (error) {
            return reply.notFound('Website not found or not allowed')
        }
    }

    return reply.status(200).send(collaborators)
}

export async function addCollaborator(
    req: FastifyRequest<{
        Params: ParamsSchemaType
        Body: CollaboratorSchemaType
    }>,
    reply: FastifyReply
) {
    const { websiteId, userId } = req.params
    const { permissionLevel } = req.body

    try {
        const collaborator = await req.server.kysely.db
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
                    .insertInto('collaboration.collaborator')
                    .values(({ selectFrom, and }) => ({
                        website_id: selectFrom('structure.website')
                            .select('id')
                            .where(
                                and({ id: websiteId, user_id: req.user?.id })
                            )
                            .where('user_id', '!=', userId),
                        user_id: userId,
                        permission_level: permissionLevel
                    }))
                    .returningAll()
                    .executeTakeFirstOrThrow()
            })

        return reply.status(201).send(collaborator)
    } catch (error) {
        return reply.notFound('Website not found or not allowed')
    }
}

export async function updateCollaborator(
    req: FastifyRequest<{
        Params: ParamsSchemaType
        Body: CollaboratorSchemaType
    }>,
    reply: FastifyReply
) {
    const { websiteId, userId } = req.params
    const { permissionLevel } = req.body

    try {
        const collaborator = await req.server.kysely.db
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
                    .updateTable('collaboration.collaborator')
                    .set({
                        website_id: websiteId,
                        user_id: userId,
                        permission_level: permissionLevel
                    })
                    .where(({ selectFrom, exists, and }) =>
                        and([
                            and({ website_id: websiteId, user_id: userId }),
                            exists(
                                selectFrom('structure.website').where(
                                    and({
                                        id: websiteId,
                                        user_id: req.user?.id
                                    })
                                )
                            )
                        ])
                    )
                    .returningAll()
                    .executeTakeFirstOrThrow()
            })

        return reply.status(200).send(collaborator)
    } catch (error) {
        return reply.notFound('Website not found or not allowed')
    }
}

export async function removeCollaborator(
    req: FastifyRequest<{ Params: ParamsSchemaType }>,
    reply: FastifyReply
) {
    const { websiteId, userId } = req.params

    try {
        const collaborator = await req.server.kysely.db
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
                    .deleteFrom('collaboration.collaborator')
                    .where(({ exists, selectFrom, and }) =>
                        and([
                            and({ website_id: websiteId, user_id: userId }),
                            exists(
                                selectFrom('structure.website').where(
                                    and({
                                        id: websiteId,
                                        user_id: req.user?.id
                                    })
                                )
                            )
                        ])
                    )
                    .returningAll()
                    .executeTakeFirstOrThrow()
            })

        return reply.status(200).send(collaborator)
    } catch (error) {
        return reply.notFound('Website not found or not allowed')
    }
}
