import { FastifyInstance } from 'fastify'
import {
    createPage,
    getPage,
    updatePage,
    deletePage,
    getAllPages
} from './pages-controller.js'
import {
    CreatePageSchemaType,
    createPageSchema,
    updatePageSchema,
    UpdatePageSchemaType,
    pageParamsSchema,
    PageParamsSchemaType,
    singlePageParamsSchema,
    SinglePageParamsSchemaType
} from './pages-schemas.js'

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

    fastify.get<{ Params: PageParamsSchemaType }>(
        '/:websiteId/pages/:pageId',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: pageParamsSchema
            }
        },
        getPage
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
        updatePage
    )

    fastify.delete<{ Params: PageParamsSchemaType }>(
        '/:websiteId/pages/:pageId',
        {
            schema: { tags: commonSchema.schema.tags, params: pageParamsSchema }
        },
        deletePage
    )
}

export const autoPrefix = '/websites'
