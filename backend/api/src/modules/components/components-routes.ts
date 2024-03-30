import { FastifyInstance } from 'fastify'
import {
    createComponent,
    deleteComponent,
    getAllComponents,
    getAllComponentsWebsocket,
    getComponent,
    setComponentPosition,
    updateComponent,
    updateComponentPosition
} from './components-controller.js'
import {
    ComponentPositionSchemaType,
    CreateComponentSchemaType,
    ParamsSchemaType,
    SingleParamsSchemaType,
    UpdateComponentSchemaType,
    componentPositionSchema,
    createComponentSchema,
    paramsSchema,
    singleParamsSchema,
    updateComponentSchema
} from './components-schemas.js'

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

    fastify.route({
        method: 'GET',
        url: '/pages/:id/components',
        schema: {
            tags: commonSchema.schema.tags
        },
        handler: getAllComponents,
        wsHandler: getAllComponentsWebsocket
    })

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
