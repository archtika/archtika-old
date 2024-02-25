import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { GitHub } from "arctic";

async function oAuth(fastify: FastifyInstance) {
  const github = new GitHub(fastify.config.DEV_GITHUB_CLIENT_ID, fastify.config.DEV_GITHUB_CLIENT_SECRET)

  fastify.decorateRequest('github', null)

  fastify.addHook('onRequest', req => {
    req.github = github
  })
}

export default fastifyPlugin(oAuth)