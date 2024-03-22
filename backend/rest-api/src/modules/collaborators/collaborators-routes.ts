import { FastifyInstance } from 'fastify'
import {
    addCollaborator,
    removeCollaborator,
    updateCollaborator,
    viewCollaborators
} from './collaborators-controller.js'
import {
    paramsSchema,
    ParamsSchemaType,
    singleParamsSchema,
    SingleParamsSchemaType,
    modifyCollaboratorSchema,
    ModifyCollaboratorSchemaType
} from './collaborators-schemas.js'

const commonSchema = {
    schema: {
        tags: ['collaborators']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.get<{ Params: SingleParamsSchemaType }>(
        '/:id/collaborators',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: singleParamsSchema
            }
        },
        viewCollaborators
    )

    fastify.post<{
        Params: ParamsSchemaType
        Body: ModifyCollaboratorSchemaType
    }>(
        '/:websiteId/collaborators/:userId',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema,
                body: modifyCollaboratorSchema
            }
        },
        addCollaborator
    )

    fastify.patch<{
        Params: ParamsSchemaType
        Body: ModifyCollaboratorSchemaType
    }>(
        '/:websiteId/collaborators/:userId',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema,
                body: modifyCollaboratorSchema
            }
        },
        updateCollaborator
    )

    fastify.delete<{ Params: ParamsSchemaType }>(
        '/:websiteId/collaborators/:userId',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema
            }
        },
        removeCollaborator
    )
}

export const autoPrefix = '/websites'
