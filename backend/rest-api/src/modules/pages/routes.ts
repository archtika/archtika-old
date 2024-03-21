import { FastifyInstance } from 'fastify'
import {
    createPage,
    getPageById,
    updatePageById,
    deletePage,
    getAllPages
} from './controller.js'
import {
    CreatePageSchemaType,
    createPageSchema,
    updatePageSchema,
    UpdatePageSchemaType,
    pageParamsSchema,
    PageParamsSchemaType,
    singlePageParamsSchema,
    SinglePageParamsSchemaType
} from './schemas.js'

const commonSchema = {
    schema: {
        tags: ['pages']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.post<{
        Params: SinglePageParamsSchemaType
        Body: CreatePageSchemaType
    }>(
        '/:id/pages',
        {
            schema: {
                tags: commonSchema.schema.tags,
                body: createPageSchema,
                params: singlePageParamsSchema
            }
        },
        createPage
    )

    fastify.get<{ Params: PageParamsSchemaType }>(
        '/:websiteId/pages/:pageId',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: pageParamsSchema
            }
        },
        getPageById
    )

    fastify.patch<{ Params: PageParamsSchemaType; Body: UpdatePageSchemaType }>(
        '/:websiteId/pages/:pageId',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: pageParamsSchema,
                body: updatePageSchema
            }
        },
        updatePageById
    )

    fastify.delete<{ Params: PageParamsSchemaType }>(
        '/:websiteId/pages/:pageId',
        {
            schema: { tags: commonSchema.schema.tags, params: pageParamsSchema }
        },
        deletePage
    )

    fastify.get<{ Params: SinglePageParamsSchemaType }>(
        '/:id/pages',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: singlePageParamsSchema
            }
        },
        getAllPages
    )
}

export const autoPrefix = '/websites'
