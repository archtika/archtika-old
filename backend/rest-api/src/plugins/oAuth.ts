import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { GitHub, Google } from 'arctic'

async function oAuth(fastify: FastifyInstance) {
    const github = new GitHub(
        fastify.config.DEV_GITHUB_CLIENT_ID,
        fastify.config.DEV_GITHUB_CLIENT_SECRET
    )
    const google = new Google(
        fastify.config.DEV_GOOGLE_CLIENT_ID,
        fastify.config.DEV_GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/account/login/google/callback'
    )

    fastify.decorate('oAuth', {
        github,
        google,
    })
}

export default fastifyPlugin(oAuth)
