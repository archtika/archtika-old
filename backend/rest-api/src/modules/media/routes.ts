import { FastifyInstance } from 'fastify'
import { createMedia, deleteMedia } from './controller.js'
import { Type } from '@sinclair/typebox'
import {
    deleteMediaParamsSchema,
    DeleteMediaParamsSchemaType
} from './schemas.js'

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

    fastify.delete<{ Params: DeleteMediaParamsSchemaType }>(
        '/:id',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: deleteMediaParamsSchema
            }
        },
        deleteMedia
    )
}

export const autoPrefix = '/media'
