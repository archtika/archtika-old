import { FastifyInstance } from 'fastify'

const commonSchema = {
    schema: {
        tags: ['collaborators']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.get(
        '/collaborators/:id',
        {
            schema: {
                tags: commonSchema.schema.tags
            }
        },
        async () => {}
    )

    fastify.post(
        '/collaborators/:id',
        {
            schema: {
                tags: commonSchema.schema.tags
            }
        },
        async () => {}
    )

    fastify.patch(
        '/collaborators/:id',
        {
            schema: {
                tags: commonSchema.schema.tags
            }
        },
        async () => {}
    )

    fastify.delete(
        '/collaborators/:id',
        {
            schema: {
                tags: commonSchema.schema.tags
            }
        },
        async () => {}
    )
}

export const autoPrefix = '/websites'
