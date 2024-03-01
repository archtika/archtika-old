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
    websiteParamsSchema,
    WebsiteParamsSchemaType
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
        Params: WebsiteParamsSchemaType
        Body: UpdateWebsiteSchemaType
    }>(
        '/:id',
        {
            schema: {
                params: websiteParamsSchema,
                body: updateWebsiteSchema,
                tags: commonSchema.schema.tags
            }
        },
        updateWebsiteById
    )

    fastify.delete<{ Params: WebsiteParamsSchemaType }>(
        '/:id',
        {
            schema: {
                params: websiteParamsSchema,
                tags: commonSchema.schema.tags
            }
        },
        deleteWebsite
    )

    fastify.get('/', commonSchema, getAllWebsites)
}

export const autoPrefix = '/websites'
