import fastifyPlugin from 'fastify-plugin'
import fastifyEnv from '@fastify/env'
import { FastifyInstance } from 'fastify'

async function env (fastify: FastifyInstance) {
  fastify.register(fastifyEnv, {
    schema: {
      type: 'object',
      required: ['DEV_GITHUB_CLIENT_ID', 'DEV_GITHUB_CLIENT_SECRET'],
      properties: {
        DEV_GITHUB_CLIENT_ID: { type: 'string' },
        DEV_GITHUB_CLIENT_SECRET: { type: 'string' }
      }
    },
    dotenv: true,
  })
}

export default fastifyPlugin(env)