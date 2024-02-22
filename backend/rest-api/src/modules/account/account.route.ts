import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { CreateAccountResponseSchema, CreateAccountSchema, LoginResponseSchema, LoginSchema, createAccountResponseSchema, createAccountSchema, loginSchema, loginResponseSchema } from './account.schema.js'
import { createAccount, login } from './account.controller.js'

export async function accountRoutes(fastify: FastifyInstance) {
  fastify.get('/', (req: FastifyRequest, reply: FastifyReply) => {
    reply.send({ message: '/ route hit' })
  })

  fastify.post<{ Body: CreateAccountSchema, Reply: CreateAccountResponseSchema }>(
    '/register',
    {
      schema: {
        body: createAccountSchema,
        response: {
          201: createAccountResponseSchema
        },
      },
    },
    createAccount
  )

  fastify.post<{ Body: LoginSchema, Reply: LoginResponseSchema }>('/login',
    {
      schema: {
        body: loginSchema,
        response: {
          200: loginResponseSchema
        }
      }
    },
    login
  )

  fastify.post('/logout', () => {})

  fastify.log.info('Account routes registered');
}