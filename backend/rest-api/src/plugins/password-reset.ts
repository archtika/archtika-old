import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { generateId } from 'lucia'
import { TimeSpan, createDate } from 'oslo'

async function passwordReset(fastify: FastifyInstance) {
    async function createPasswordResetToken(userId: string) {
        await fastify.pg.query(
            'DELETE FROM password_reset_token WHERE user_id = $1',
            [userId]
        )

        const tokenId = generateId(40)

        await fastify.pg.query(
            'INSERT INTO password_reset_token (id, user_id, expires_at) VALUES ($1, $2, $3)',
            [tokenId, userId, createDate(new TimeSpan(2, 'h'))]
        )

        return tokenId
    }

    fastify.decorateRequest(
        'createPasswordResetToken',
        createPasswordResetToken
    )
}

export default fastifyPlugin(passwordReset)
