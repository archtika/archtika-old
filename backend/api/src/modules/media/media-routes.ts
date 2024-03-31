import { FastifyInstance } from 'fastify'
import {
    createMedia,
    deleteMedia,
    getAllMedia,
    getMedia
} from './media-controller.js'
import { ParamsSchemaType, paramsSchema } from './media-schemas.js'

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

    fastify.get<{ Params: ParamsSchemaType }>(
        '/:id',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema
            }
        },
        getMedia
    )

    fastify.delete<{ Params: ParamsSchemaType }>(
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
