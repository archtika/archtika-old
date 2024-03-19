import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

async function swagger(fastify: FastifyInstance) {
    fastify.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'Archtika API',
                version: '1'
            },
            externalDocs: {
                url: 'https://github.com/archtika/archtika'
            },
            tags: [
                {
                    name: 'account'
                },
                {
                    name: 'websites'
                },
                {
                    name: 'pages'
                },
                {
                    name: 'components'
                },
                {
                    name: 'media'
                },
                {
                    name: 'collaborators'
                },
                {
                    name: 'change-log'
                }
            ],
            components: {
                securitySchemes: {
                    oAuthGoogle: {
                        type: 'oauth2',
                        description: 'Google OAuth2',
                        flows: {
                            authorizationCode: {
                                authorizationUrl:
                                    'http://localhost:3000/api/v1/account/login/google',
                                scopes: {},
                                tokenUrl:
                                    'http://localhost:3000/api/v1/account/login/google/callback'
                            }
                        }
                    },
                    oAuthGitHub: {
                        type: 'oauth2',
                        description: 'GitHub OAuth2',
                        flows: {
                            authorizationCode: {
                                authorizationUrl:
                                    'http://localhost:3000/api/v1/account/login/github',
                                scopes: {},
                                tokenUrl:
                                    'http://localhost:3000/api/v1/account/login/github/callback'
                            }
                        }
                    }
                }
            }
        }
    })

    fastify.register(fastifySwaggerUi, {
        routePrefix: '/docs'
    })
}

export default fastifyPlugin(swagger)
