import { FastifyRequest, FastifyReply } from 'fastify'

export async function createWebsite(req: FastifyRequest, reply: FastifyReply) {
    console.log('create website')
}

export async function getWebsiteById(req: FastifyRequest, reply: FastifyReply) {
    console.log('get website by id')
}

export async function updateWebsiteById(
    req: FastifyRequest,
    reply: FastifyReply
) {
    console.log('update website by id')
}

export async function deleteWebsite(req: FastifyRequest, reply: FastifyReply) {
    console.log('delete website')
}

export async function getAllWebsites(req: FastifyRequest, reply: FastifyReply) {
    console.log('get all website')
}
