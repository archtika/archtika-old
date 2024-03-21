import { FastifyReply, FastifyRequest } from 'fastify'
import { ParamsSchemaType } from './schemas.js'

export async function viewChangeLog(
    req: FastifyRequest<{ Params: ParamsSchemaType }>,
    reply: FastifyReply
) {
    const { id } = req.params

    const log = await req.server.kysely.db
        .selectFrom('tracking.change_log')
        .innerJoin(
            'structure.website',
            'structure.website.id',
            'tracking.change_log.website_id'
        )
        .selectAll('tracking.change_log')
        .where('tracking.change_log.website_id', '=', id)
        .where('structure.website.user_id', '=', req?.user?.id ?? '')
        .execute()

    if (!log.length) {
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

    return reply.status(200).send(log)
}
