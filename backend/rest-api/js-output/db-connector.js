import fastifyPlugin from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';
async function dbConnector(fastify) {
    fastify.register(fastifyPostgres, {
        connectionString: 'postgres://postgres:password@localhost:5432/postgres'
    });
}
export default fastifyPlugin(dbConnector);
