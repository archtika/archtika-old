import { FastifyInstance } from 'fastify'
import {
    addCollaborator,
    removeCollaborator,
    updateCollaborator,
    getAllCollaborators
} from './collaborators-controller.js'
import {
    paramsSchema,
    ParamsSchemaType,
    singleParamsSchema,
    SingleParamsSchemaType,
    collaboratorSchema,
    CollaboratorSchemaType
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
