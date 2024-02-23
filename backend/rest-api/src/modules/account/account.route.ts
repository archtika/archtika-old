import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { CreateAccountResponseSchema, CreateAccountSchema, LoginSchema, createAccountResponseSchema, createAccountSchema, loginSchema } from './account.schema.js'
import { createAccount, login, logout } from './account.controller.js'
import { getSession } from '../../utils/getSession.js';

export async function accountRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (req: FastifyRequest, reply: FastifyReply) => {
    const session = await getSession(req, reply)

    reply.send({ message: req.user })
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

  fastify.post<{ Body: LoginSchema }>('/login',
    {
      schema: {
        body: loginSchema,
      }
    },
    login
  )

  fastify.post('/logout',
    logout
  )

  fastify.log.info('Account routes registered');
}