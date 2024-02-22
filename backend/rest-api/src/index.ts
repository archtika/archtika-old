import Fastify from 'fastify'
import { TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'

import { accountRoutes } from './modules/account/account.route.js'

import dbConnector from './plugins/postgres.js'
import swagger from './plugins/swagger.js'

export const fastify = Fastify({
  logger: true
}).withTypeProvider<TypeBoxTypeProvider>().setValidatorCompiler(TypeBoxValidatorCompiler)

fastify.register(jwt, { secret: 'supersecret' })

fastify.addHook('preHandler', (req, res, next) => {
  req.jwt = fastify.jwt
  return next()
})

fastify.register(cookie, {
  secret: 'supersecret',
  hook: 'preHandler'
})

fastify.register(swagger)
fastify.register(dbConnector)

fastify.register(accountRoutes, { prefix: '/account'})

fastify.listen({ port: 3000 });