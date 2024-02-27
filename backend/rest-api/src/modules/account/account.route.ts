import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
    loginWithGithub,
    loginWithGithubCallback,
    loginWithGoogle,
    loginWithGoogleCallback,
    logout,
} from './account.controller.js'
import { getSession } from '../../utils/getSession.js'

export async function accountRoutes(fastify: FastifyInstance) {
    fastify.get('/', async (req: FastifyRequest, reply: FastifyReply) => {
        await getSession(req, reply)

        reply.send({ user: req.user, session: req.session })
    })

    fastify.get('/login/github', loginWithGithub)

    fastify.get('/login/github/callback', loginWithGithubCallback)

    fastify.get('/login/google', loginWithGoogle)

    fastify.get('/login/google/callback', loginWithGoogleCallback)

    fastify.get('/logout', logout)

    fastify.log.info('Account routes registered')
}
