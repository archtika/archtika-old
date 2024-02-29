import { FastifyInstance } from 'fastify'
import {
    viewAccountInformation,
    loginWithGithub,
    loginWithGithubCallback,
    loginWithGoogle,
    loginWithGoogleCallback,
    logout,
    deleteAccount
} from './controller.js'

const commonSchema = {
    schema: {
        tags: ['account']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.get('/', commonSchema, viewAccountInformation)

    fastify.get('/login/github', commonSchema, loginWithGithub)

    fastify.get('/login/github/callback', commonSchema, loginWithGithubCallback)

    fastify.get('/login/google', commonSchema, loginWithGoogle)

    fastify.get('/login/google/callback', commonSchema, loginWithGoogleCallback)

    fastify.get('/logout', commonSchema, logout)

    fastify.delete('/', commonSchema, deleteAccount)
}

export const autoPrefix = '/account'
