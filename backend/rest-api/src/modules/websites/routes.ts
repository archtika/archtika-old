import { FastifyInstance } from 'fastify'
import {
    createWebsite,
    getWebsiteById,
    updateWebsiteById,
    deleteWebsite,
    getAllWebsites
} from './controller.js'
import {
    CreateWebsiteSchemaType,
    createWebsiteSchema,
    updateWebsiteSchema,
    UpdateWebsiteSchemaType,
    updateWebsiteParamsSchema,
    UpdateWebsiteParamsSchemaType
} from './schemas.js'

const commonSchema = {
    schema: {
        tags: ['websites']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.post<{ Body: CreateWebsiteSchemaType }>(
        '/',
        {
            schema: {
                body: createWebsiteSchema,
                tags: commonSchema.schema.tags
            }
        },
        createWebsite
    )

    fastify.get('/:id', commonSchema, getWebsiteById)

    fastify.patch<{
        Params: UpdateWebsiteParamsSchemaType
        Body: UpdateWebsiteSchemaType
    }>(
        '/:id',
        {
            schema: {
                params: updateWebsiteParamsSchema,
                body: updateWebsiteSchema,
                tags: commonSchema.schema.tags
            }
        },
        updateWebsiteById
    )

    fastify.delete('/:id', commonSchema, deleteWebsite)

    fastify.get('/', commonSchema, getAllWebsites)
}

export const autoPrefix = '/websites'
