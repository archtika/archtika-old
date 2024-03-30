import { FastifyInstance } from 'fastify'
import {
    deleteAccount,
    getAccount,
    loginWithGithub,
    loginWithGithubCallback,
    loginWithGoogle,
    loginWithGoogleCallback,
    logout
} from './account-controller.js'

const commonSchema = {
    schema: {
        tags: ['account']
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.get('/login/github', commonSchema, loginWithGithub)

    fastify.get('/login/github/callback', commonSchema, loginWithGithubCallback)

    fastify.get('/login/google', commonSchema, loginWithGoogle)

    fastify.get('/login/google/callback', commonSchema, loginWithGoogleCallback)

    fastify.get('/', commonSchema, getAccount)

    fastify.get('/logout', commonSchema, logout)

    fastify.delete('/', commonSchema, deleteAccount)
}

export const autoPrefix = '/account'
