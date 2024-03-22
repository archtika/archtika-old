import { FastifyInstance } from 'fastify'
import { paramsSchema, ParamsSchemaType } from './change-log-schemas.js'
import { viewChangeLog } from './change-log-controller.js'

const commonSchema = {
    schema: {
        tags: ['change-log']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.get<{ Params: ParamsSchemaType }>(
        '/:id/change-log',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema
            }
        },
        viewChangeLog
    )
}

export const autoPrefix = '/websites'
