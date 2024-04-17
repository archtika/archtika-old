import { FastifyInstance } from 'fastify'
import {
    createMedia,
    createMediaAssociation,
    deleteMedia,
    getAllMedia,
    getMedia
} from './media-controller.js'
import {
    createMediaAssociationSchema,
    getAllMediaQuerySchema,
    paramsSchema
} from './media-schemas.js'

const commonSchema = {
    schema: {
        tags: ['media']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.post(
        '/',
        {
            schema: {
                consumes: ['multipart/form-data'],
                tags: commonSchema.schema.tags,
                body: {
                    type: 'object',
                    required: ['file'],
                    properties: {
                        file: { isFile: true }
                    }
                }
            }
        },
        createMedia
    )

    fastify.post(
        '/association',
        {
            schema: {
                tags: commonSchema.schema.tags,
                body: createMediaAssociationSchema
            }
        },
        createMediaAssociation
    )

    fastify.get(
        '/',
        {
            schema: {
                tags: commonSchema.schema.tags,
                querystring: getAllMediaQuerySchema
            }
        },
        getAllMedia
    )

    fastify.get(
        '/:id',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema
            }
        },
        getMedia
    )

    fastify.delete(
        '/:id',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema
            }
        },
        deleteMedia
    )
}

export const autoPrefix = '/media'
