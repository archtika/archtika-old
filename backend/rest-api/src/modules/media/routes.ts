import { FastifyInstance } from 'fastify'
import { createMedia } from './controller.js'
import { Type } from '@sinclair/typebox'

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
}

export const autoPrefix = '/media'
