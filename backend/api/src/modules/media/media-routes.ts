import { FastifyInstance } from 'fastify'
import {
    createMedia,
    deleteMedia,
    getAllMedia,
    getMedia
} from './media-controller.js'
import { paramsSchema } from './media-schemas.js'

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

    fastify.get(
        '/',
        {
            schema: {
                tags: commonSchema.schema.tags
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
