import Fastify from 'fastify'
import {
    TypeBoxTypeProvider,
    TypeBoxValidatorCompiler,
} from '@fastify/type-provider-typebox'
import fastifyAutoload from '@fastify/autoload'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envToLogger = {
    development: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        },
    },
    production: true,
    test: false,
}

const fastify = Fastify({
    logger: envToLogger['development'] ?? true,
})
    .withTypeProvider<TypeBoxTypeProvider>()
    .setValidatorCompiler(TypeBoxValidatorCompiler)

fastify.register(fastifyAutoload, {
    dir: join(__dirname, 'plugins'),
})

fastify.register(fastifyAutoload, {
    dir: join(__dirname, 'modules'),
    options: Object.assign({ prefix: '/api/v1' }),
    ignoreFilter: (path) =>
        path.endsWith('.controller.js') || path.endsWith('.schema.js'),
})

fastify.listen({ port: 3000 })
