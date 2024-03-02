import Fastify from 'fastify'
import {
    TypeBoxTypeProvider,
    TypeBoxValidatorCompiler
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
                ignore: 'pid,hostname'
            }
        }
    },
    production: true,
    test: false
}

const fastify = Fastify({
    logger: envToLogger['development'] ?? true,
    ajv: {
        plugins: [
            function (ajv: any) {
                ajv.addKeyword({ keyword: 'x-examples' })
            }
        ]
    }
})
    .withTypeProvider<TypeBoxTypeProvider>()
    .setValidatorCompiler(TypeBoxValidatorCompiler)

fastify.register(fastifyAutoload, {
    dir: join(__dirname, 'plugins')
})

fastify.register(fastifyAutoload, {
    dir: join(__dirname, 'modules'),
    options: Object.assign({ prefix: '/api/v1' }),
    ignoreFilter: (path) =>
        path.includes('schemas') ||
        path.includes('controller') ||
        path.includes('queries')
})

fastify.listen({ port: 3000 })
