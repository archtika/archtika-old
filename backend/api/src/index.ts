import fastifyAutoload from '@fastify/autoload'
import { ajvFilePlugin } from '@fastify/multipart'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { GitHub, Google } from 'arctic'
import cluster from 'cluster'
import Fastify from 'fastify'
import { Kysely } from 'kysely'
import { DB } from 'kysely-codegen'
import { Lucia, Session, User } from 'lucia'
import { Client } from 'minio'
import os from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import './utils/typebox-custom-schemas.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const cpuCount = os.availableParallelism()

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
    production: false,
    test: false
}

export function app() {
    const fastify = Fastify({
        logger: envToLogger[process.env.NODE_ENV as keyof typeof envToLogger],
        ajv: {
            plugins: [
                function (ajv: any) {
                    ajv.addKeyword({ keyword: 'x-examples' })
                },
                ajvFilePlugin
            ]
        }
    }).withTypeProvider<TypeBoxTypeProvider>()

    fastify.register(fastifyAutoload, {
        dir: join(__dirname, 'plugins')
    })

    fastify.register(fastifyAutoload, {
        dir: join(__dirname, 'modules'),
        options: Object.assign({ prefix: '/api/v1' }),
        ignoreFilter: (path) =>
            path.includes('schemas') ||
            path.includes('controller') ||
            path.includes('tests'),
        autoHooks: true,
        cascadeHooks: true
    })

    return fastify
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
    if (cluster.isPrimary) {
        for (let i = 0; i < cpuCount; i++) {
            console.log(`Forking process number ${i}`)
            cluster.fork()
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`)
            cluster.fork()
        })
    } else {
        const fastify = app()
        fastify.listen({ port: 3000 })
    }
}

declare module 'fastify' {
    interface FastifyInstance {
        config: {
            DEV_GITHUB_CLIENT_ID: string
            DEV_GITHUB_CLIENT_SECRET: string
            DEV_GOOGLE_CLIENT_ID: string
            DEV_GOOGLE_CLIENT_SECRET: string
            DATABASE_URL: string
        }
        lucia: {
            luciaInstance: Lucia
            oAuth: {
                github: GitHub
                google: Google
            }
        }
        kysely: {
            db: Kysely<DB>
        }
        minio: {
            client: Client
        }
    }
    interface FastifyRequest {
        user: User | null
        session: Session | null
    }
}
