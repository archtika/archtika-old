import { FastifyInstance } from 'fastify'
import {
    createMedia,
    createMediaAssociation,
    deleteMedia,
    getAllMedia,
    getMedia
} from './media-controller.js'
import {
    ParamsSchemaType,
    CreateMediaAssociationSchemaType,
    createMediaAssociationSchema,
    paramsSchema,
    GetAllMediaQuerySchemaType,
    getAllMediaQuerySchema
} from './media-schemas.js'

const commonSchema = {
    schema: {
        tags: ['media']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.post(
        '/',
        {
            schema: {
                consumes: ['multipart/form-data'],
                tags: commonSchema.schema.tags,
                body: {
                    type: 'object',
                    required: ['file'],
                    properties: {
                        file: { isFile: true }
                    }
                }
            }
        },
        createMedia
    )

    fastify.post<{ Body: CreateMediaAssociationSchemaType }>(
        '/association',
        {
            schema: {
                tags: commonSchema.schema.tags,
                body: createMediaAssociationSchema
            }
        },
        createMediaAssociation
    )

    fastify.get<{ Querystring: GetAllMediaQuerySchemaType }>(
        '/',
        {
            schema: {
                tags: commonSchema.schema.tags,
                querystring: getAllMediaQuerySchema
            }
        },
        getAllMedia
    )

    fastify.get<{ Params: ParamsSchemaType }>(
        '/:id',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema
            }
        },
        getMedia
    )

    fastify.delete<{ Params: ParamsSchemaType }>(
        '/:id',
        {
            schema: {
                tags: commonSchema.schema.tags,
                params: paramsSchema
            }
        },
        deleteMedia
    )
}

export const autoPrefix = '/media'
