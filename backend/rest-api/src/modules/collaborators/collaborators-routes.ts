import { FastifyInstance } from 'fastify'
import {
    addCollaborator,
    getAllCollaborators,
    removeCollaborator,
    updateCollaborator
} from './collaborators-controller.js'
import {
    CollaboratorSchemaType,
    ParamsSchemaType,
    SingleParamsSchemaType,
    collaboratorSchema,
    paramsSchema,
    singleParamsSchema
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
        getAllCollaborators
    )

    fastify.post<{
        Params: ParamsSchemaType
        Body: CollaboratorSchemaType
    }>(
        '/:websiteId/collaborators/:userId',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema,
                body: collaboratorSchema
            }
        },
        addCollaborator
    )

    fastify.patch<{
        Params: ParamsSchemaType
        Body: CollaboratorSchemaType
    }>(
        '/:websiteId/collaborators/:userId',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema,
                body: collaboratorSchema
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
