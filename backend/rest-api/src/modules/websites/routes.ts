import { FastifyInstance } from 'fastify'
import {
    createWebsite,
    getWebsiteById,
    updateWebsiteById,
    deleteWebsite,
    getAllWebsites
} from './controller.js'

const commonSchema = {
    schema: {
        tags: ['websites']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.post('/', commonSchema, createWebsite)

    fastify.get('/:id', commonSchema, getWebsiteById)

    fastify.put('/:id', commonSchema, updateWebsiteById)

    fastify.delete('/:id', commonSchema, deleteWebsite)

    fastify.get('/', commonSchema, getAllWebsites)
}

export const autoPrefix = '/websites'
