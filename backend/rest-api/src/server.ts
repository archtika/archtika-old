import Fastify from 'fastify'
import accountRoute from './account.js'
import dbConnector from './db-connector.js'

const fastify = Fastify({
  logger: true
})

fastify.register(accountRoute)
fastify.register(dbConnector)

fastify.get('/pong', async (request, reply) => {
  return 'hello world'
})

fastify.listen({ port: 3000 }, function (err) {
  if (err) {
    fastify.log.error(err)
  }
  // Server is now listening on ${address}
})