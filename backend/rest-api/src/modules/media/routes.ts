import { FastifyInstance } from 'fastify'
import { createMediaSchema, CreateMediaSchemaType } from './schemas.js'
import { createMedia } from './controller.js'

const commonSchema = {
    schema: {
        tags: ['media']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.post<{
        Body: CreateMediaSchemaType
    }>(
        '/',
        {
            schema: {
                tags: commonSchema.schema.tags,
                body: createMediaSchema
            }
        },
        createMedia
    )
}

export const autoPrefix = '/media'
