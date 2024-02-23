import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { CreateAccountResponseSchema, CreateAccountSchema, EmailVerificationSchema, LoginSchema, VerifyPasswordResetTokenSchema, createAccountResponseSchema, createAccountSchema, emailVerificationSchema, loginSchema, verifyPasswordResetTokenSchema } from './account.schema.js'
import { createAccount, login, logout, requestEmailVerificationCode, resetPassword, verifyEmail, verifyPasswordResetToken } from './account.controller.js'
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

  fastify.post<{ Body: EmailVerificationSchema }>(
    '/email-verification',
    {
      schema: {
        body: emailVerificationSchema
      }
    },
    verifyEmail
  )

  fastify.post(
    '/request-email-verification-code',
    {
      config: {
        rateLimit: {
          max: 1
        }
      }
    },
    requestEmailVerificationCode
  )

  fastify.post(
    '/reset-password',
    {
      config: {
        rateLimit: {
          max: 1,
          timeWindow: 2 * 60 * 60 * 1000
        }
      }
    },
    resetPassword
  )

  fastify.post<{ Body: VerifyPasswordResetTokenSchema }>(
    '/reset-password/:token',
    {
      schema: {
        body: verifyPasswordResetTokenSchema
      }
    },
    verifyPasswordResetToken
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