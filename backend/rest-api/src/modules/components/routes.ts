import { FastifyInstance } from 'fastify'

const commonSchema = {
    schema: {
        tags: ['components']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.post(
        '/:id/components',
        {
            schema: {
                tags: commonSchema.schema.tags
            }
        },
        async () => {}
    )

    fastify.get(
        '/:pageId/components/:componentId',
        {
            schema: {
                tags: commonSchema.schema.tags
            }
        },
        async () => {}
    )

    fastify.patch(
        '/:pageId/components/:componentId',
        {
            schema: {
                tags: commonSchema.schema.tags
            }
        },
        async () => {}
    )

    fastify.delete(
        '/:pageId/components/:componentId',
        {
            schema: { tags: commonSchema.schema.tags }
        },
        async () => {}
    )

    fastify.get(
        '/:id/components',
        {
            schema: {
                tags: commonSchema.schema.tags
            }
        },
        async () => {}
    )
}

export const autoPrefix = '/pages'
