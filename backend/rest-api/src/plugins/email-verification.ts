import { FastifyInstance } from 'fastify'
import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo'
import { generateRandomString, alphabet } from 'oslo/crypto'
import { User } from 'lucia'
import fastifyPlugin from 'fastify-plugin'

async function emailVerification(fastify: FastifyInstance) {
    async function generateEmailVerificationCode(
        userId: string,
        email: string
    ) {
        await fastify.pg.query(
            'DELETE FROM email_verification_code WHERE user_id = $1',
            [userId]
        )

        const code = generateRandomString(8, alphabet('0-9'))

        await fastify.pg.query(
            'INSERT INTO email_verification_code (code, user_id, email, expires_at) VALUES ($1, $2, $3, $4)',
            [code, userId, email, createDate(new TimeSpan(5, 'm'))]
        )

        return code
    }

    async function verifyVerificationCode(user: User, code: string) {
        const databaseCode = (
            await fastify.pg.query(
                'SELECT * FROM email_verification_code WHERE user_id = $1',
                [user.id]
            )
        ).rows[0]

        if (!databaseCode || databaseCode.code !== code) {
            return false
        }

        await fastify.pg.query(
            'DELETE FROM email_verification_code WHERE user_id = $1',
            [user.id]
        )

        if (!isWithinExpirationDate(databaseCode.expires_at)) {
            return false
        }

        if (databaseCode.email !== user.email) {
            return false
        }

        return true
    }

    fastify.decorateRequest(
        'generateEmailVerificationCode',
        generateEmailVerificationCode
    )
    fastify.decorateRequest('verifyVerificationCode', verifyVerificationCode)
}

export default fastifyPlugin(emailVerification)
