import { FastifyInstance } from 'fastify'
import {
    paramsSchema,
    ParamsSchemaType,
    singleParamsSchema,
    SingleParamsSchemaType,
    createComponentSchema,
    CreateComponentSchemaType,
    updateComponentSchema,
    UpdateComponentSchemaType,
    componentPositionSchema,
    ComponentPositionSchemaType
} from './components-schemas.js'
import {
    createComponent,
    deleteComponent,
    getComponent,
    getAllComponents,
    updateComponent,
    setComponentPosition,
    updateComponentPosition
} from './components-controller.js'

const commonSchema = {
    schema: {
        tags: ['components']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.post<{
        Params: SingleParamsSchemaType
        Body: CreateComponentSchemaType
    }>(
        '/pages/:id/components',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: singleParamsSchema,
                body: createComponentSchema
            }
        },
        createComponent
    )

    fastify.get<{ Params: ParamsSchemaType }>(
        '/pages/:pageId/components/:componentId',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema
            }
        },
        getComponent
    )

    fastify.patch<{
        Params: ParamsSchemaType
        Body: UpdateComponentSchemaType
    }>(
        '/pages/:pageId/components/:componentId',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema,
                body: updateComponentSchema
            }
        },
        updateComponent
    )

    fastify.delete(
        '/pages/:pageId/components/:componentId',
        {
            schema: { tags: commonSchema.schema.tags }
        },
        deleteComponent
    )

    fastify.get(
        '/pages/:id/components',
        {
            schema: {
                tags: commonSchema.schema.tags
            }
        },
        getAllComponents
    )

    fastify.post<{
        Params: SingleParamsSchemaType
        Body: ComponentPositionSchemaType
    }>(
        '/components/:id/position',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: singleParamsSchema,
                body: componentPositionSchema
            }
        },
        setComponentPosition
    )

    fastify.patch<{
        Params: SingleParamsSchemaType
        Body: ComponentPositionSchemaType
    }>(
        '/components/:id/position',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: singleParamsSchema,
                body: componentPositionSchema
            }
        },
        updateComponentPosition
    )
}

export const autoPrefix = '/'
