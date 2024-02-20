import Fastify from 'fastify'
import accountRoute from './account'
import dbConnector from './db-connector'

const fastify = Fastify({
  logger: true
})

fastify.register(accountRoute)
fastify.register(dbConnector)

fastify.listen({ port: 3000 }, function (err) {
  if (err) {
    fastify.log.error(err)
  }
  // Server is now listening on ${address}
})