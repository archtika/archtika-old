import { FastifyInstance } from "fastify"

const signUpJTD = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' }
        }
      }
    }
  }
}

async function routes (fastify: FastifyInstance) {
  fastify.post('/signup', signUpJTD, async (request, reply) => {
    return request.body
  })
}

export default routes