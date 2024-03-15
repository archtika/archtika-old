import { FastifyInstance } from 'fastify'
import {
    componentParamsSchema,
    ComponentParamsSchemaType,
    componentSingleParamsSchema,
    ComponentSingleParamsSchemaType,
    createComponentSchema,
    CreateComponentSchemaType,
    updateComponentSchema,
    UpdateComponentSchemaType,
    componentPositionSchema,
    ComponentPositionSchemaType
} from './schemas.js'
import {
    createComponent,
    deleteComponent,
    getComponentById,
    getAllComponents,
    updateComponentById,
    setComponentPosition,
    updateComponentPosition
} from './controller.js'

const commonSchema = {
    schema: {
        tags: ['components']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.post<{
        Params: ComponentSingleParamsSchemaType
        Body: CreateComponentSchemaType
    }>(
        '/:id/components',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: componentSingleParamsSchema,
                body: createComponentSchema
            }
        },
        createComponent
    )

    fastify.get<{ Params: ComponentParamsSchemaType }>(
        '/:pageId/components/:componentId',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: componentParamsSchema
            }
        },
        getComponentById
    )

    fastify.patch<{
        Params: ComponentParamsSchemaType
        Body: UpdateComponentSchemaType
    }>(
        '/:pageId/components/:componentId',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: componentParamsSchema,
                body: updateComponentSchema
            }
        },
        updateComponentById
    )

    fastify.delete(
        '/:pageId/components/:componentId',
        {
            schema: { tags: commonSchema.schema.tags }
        },
        deleteComponent
    )

    fastify.get(
        '/:id/components',
        {
            schema: {
                tags: commonSchema.schema.tags
            }
        },
        getAllComponents
    )

    fastify.post<{
        Params: ComponentParamsSchemaType
        Body: ComponentPositionSchemaType
    }>(
        '/:pageId/components/:componentId/position',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: componentParamsSchema,
                body: componentPositionSchema
            }
        },
        setComponentPosition
    )

    fastify.patch<{
        Params: ComponentParamsSchemaType
        Body: ComponentPositionSchemaType
    }>(
        '/:pageId/components/:componentId/position',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: componentParamsSchema,
                body: componentPositionSchema
            }
        },
        updateComponentPosition
    )
}

export const autoPrefix = '/pages'
