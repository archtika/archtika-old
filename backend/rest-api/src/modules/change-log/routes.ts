import { FastifyInstance } from 'fastify'

const commonSchema = {
    schema: {
        tags: ['change-log']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.get(
        '/:id/change-log',
        {
            schema: {
                tags: commonSchema.schema.tags
            }
        },
        async () => {}
    )
}

export const autoPrefix = '/websites'
