import Fastify from 'fastify'
import { TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox'

import { accountRoutes } from './modules/account/account.route.js'

import dbConnector from './plugins/postgres.js'
import swagger from './plugins/swagger.js'
import cookie from './plugins/cookie.js'
import csrf from './plugins/csrf.js'
import auth from './plugins/auth.js'
import sensible from './plugins/sensible.js'
import rateLimit from './plugins/rate-limit.js'

export const fastify = Fastify({
  logger: true
}).withTypeProvider<TypeBoxTypeProvider>().setValidatorCompiler(TypeBoxValidatorCompiler)

fastify.register(swagger)
fastify.register(dbConnector)
fastify.register(cookie)
fastify.register(csrf, {
  enabled: process.env.NODE_ENV === 'production'
})
fastify.register(auth)
fastify.register(sensible)
fastify.register(rateLimit)

fastify.register(accountRoutes, { prefix: '/account'})

fastify.listen({ port: 3000 });