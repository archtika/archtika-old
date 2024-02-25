import fastifyPlugin from 'fastify-plugin'
import fastifyEnv from '@fastify/env'
import { FastifyInstance } from 'fastify'

async function env (fastify: FastifyInstance) {
  fastify.register(fastifyEnv, {
    schema: {
      type: 'object'
    },
    dotenv: true
  })
}

export default fastifyPlugin(env)