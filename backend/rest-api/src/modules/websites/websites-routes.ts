import { FastifyInstance } from 'fastify'
import {
    createWebsite,
    getWebsite,
    updateWebsite,
    deleteWebsite,
    getAllWebsites
} from './websites-controller.js'
import {
    CreateWebsiteSchemaType,
    createWebsiteSchema,
    updateWebsiteSchema,
    UpdateWebsiteSchemaType,
    websiteParamsSchema,
    WebsiteParamsSchemaType
} from './websites-schemas.js'

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

    fastify.get('/', commonSchema, getAllWebsites)

    fastify.get('/:id', commonSchema, getWebsite)

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
        updateWebsite
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
}

export const autoPrefix = '/websites'
