import { FastifyReply, FastifyRequest } from 'fastify'
import {
    ParamsSchemaType,
    SingleParamsSchemaType,
    ModifyCollaboratorSchemaType
} from './schemas.js'

export async function viewCollaborators(
    req: FastifyRequest<{ Params: SingleParamsSchemaType }>,
    reply: FastifyReply
) {
    const { id } = req.params

    const collaborators = await req.server.kysely.db
        .selectFrom('collaboration.collaborator')
        .innerJoin(
            'structure.website',
            'structure.website.id',
            'collaboration.collaborator.website_id'
        )
        .selectAll('collaboration.collaborator')
        .where('website_id', '=', id)
        .where('structure.website.user_id', '=', req?.user?.id ?? '')
        .execute()

    if (!collaborators.length) {
        try {
            await req.server.kysely.db
                .selectFrom('structure.website')
                .select('id')
                .where((eb) => eb.and({ id, user_id: req.user?.id }))
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
        Body: ModifyCollaboratorSchemaType
    }>,
    reply: FastifyReply
) {
    const { websiteId, userId } = req.params
    const { permissionLevel } = req.body

    try {
        const collaborator = await req.server.kysely.db
            .insertInto('collaboration.collaborator')
            .values(({ selectFrom }) => ({
                website_id: selectFrom('structure.website')
                    .select('id')
                    .where((eb) =>
                        eb.and({ id: websiteId, user_id: req.user?.id })
                    )
                    .where('user_id', '!=', userId),
                user_id: userId,
                permission_level: permissionLevel
            }))
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(201).send(collaborator)
    } catch (error) {
        return reply.notFound('Website not found or not allowed')
    }
}

export async function updateCollaborator(
    req: FastifyRequest<{
        Params: ParamsSchemaType
        Body: ModifyCollaboratorSchemaType
    }>,
    reply: FastifyReply
) {
    const { websiteId, userId } = req.params
    const { permissionLevel } = req.body

    try {
        const collaborator = await req.server.kysely.db
            .updateTable('collaboration.collaborator')
            .set(({ selectFrom }) => ({
                website_id: selectFrom('structure.website')
                    .select('id')
                    .where((eb) =>
                        eb.and({ id: websiteId, user_id: req.user?.id })
                    ),
                user_id: userId,
                permission_level: permissionLevel
            }))
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(201).send(collaborator)
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
            .deleteFrom('collaboration.collaborator')
            .where((eb) =>
                eb.exists(
                    eb
                        .selectFrom('structure.website')
                        .where(eb.and({ id: websiteId, user_id: req.user?.id }))
                )
            )
            .where((eb) => eb.and({ website_id: websiteId, user_id: userId }))
            .returningAll()
            .executeTakeFirstOrThrow()

        return reply.status(200).send(collaborator)
    } catch (error) {
        return reply.notFound('Website not found or not allowed')
    }
}
