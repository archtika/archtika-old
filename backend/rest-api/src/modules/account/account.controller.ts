import { FastifyRequest, FastifyReply } from 'fastify'
import {
    CreateAccountSchema,
    EmailVerificationSchema,
    LoginSchema,
    ValidateTwoFactorSchema,
    VerifyPasswordResetTokenSchema,
} from './account.schema.js'
import { Argon2id } from 'oslo/password'
import { lucia } from '../../plugins/lucia.js'
import { generateId } from 'lucia'
import { getSession } from '../../utils/getSession.js'
import { isWithinExpirationDate } from 'oslo'
import { decodeHex, encodeHex } from 'oslo/encoding'
import { TOTPController, createTOTPKeyURI } from 'oslo/otp'
import { generateCodeVerifier, generateState } from 'arctic'
import { parseCookies } from 'oslo/cookie'

export async function createAccount(
    req: FastifyRequest<{ Body: CreateAccountSchema }>,
    reply: FastifyReply
) {
    const { username, email, password } = req.body

    const existingAccount = (
        await req.server.pg.query(
            'SELECT * FROM auth_user WHERE username = $1 OR email = $2',
            [username, email]
        )
    ).rows[0]
    if (existingAccount) {
        return reply.conflict('An account with that email already exists')
    }

    const hashedPassword = await new Argon2id().hash(password)
    const userId = generateId(20)

    const account = (
        await req.server.pg.query(
            'INSERT INTO auth_user (id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
            [userId, username, email, hashedPassword]
        )
    ).rows[0]

    await req.server.pg.query(
        'INSERT INTO two_factor_authorization_code (code, user_id) VALUES ($1, $2)',
        [null, userId]
    )

    const session = await lucia.createSession(userId, {})
    const cookie = lucia.createSessionCookie(session.id)

    reply.setCookie(cookie.name, cookie.value, cookie.attributes)

    return reply.code(201).send({
        account_id: account.id,
        username,
        email,
    })
}

export async function login(
    req: FastifyRequest<{ Body: LoginSchema }>,
    reply: FastifyReply
) {
    const { email, password } = req.body

    const account = (
        await req.server.pg.query('SELECT * FROM auth_user WHERE email = $1', [
            email,
        ])
    ).rows[0]

    if (!account) {
        return reply.badRequest()
    }

    const validPassword = await new Argon2id().verify(
        account.password,
        password
    )
    if (!validPassword) {
        return reply.badRequest()
    }

    const session = await lucia.createSession(account.id, {})
    const cookie = lucia.createSessionCookie(session.id)

    reply.setCookie(cookie.name, cookie.value, cookie.attributes)

    reply.status(302).send({ message: 'Successfully logged in' })
}

export async function logout(req: FastifyRequest, reply: FastifyReply) {
    if (!req.session) {
        return reply.unauthorized()
    }

    await lucia.invalidateSession(req.session.id)

    const cookie = lucia.createBlankSessionCookie()
    reply.setCookie(cookie.name, cookie.value, cookie.attributes)

    return reply.status(200).send({ message: 'Successfully logged out' })
}

export async function verifyEmail(
    req: FastifyRequest<{ Body: EmailVerificationSchema }>,
    reply: FastifyReply
) {
    const activeSesion = await getSession(req, reply)

    if (!req.user) return

    const { code } = req.body

    const validCode = await req.verifyVerificationCode(req.user, code)

    if (!validCode) {
        return reply.notAcceptable()
    }

    await lucia.invalidateUserSessions(req.user.id)
    await req.server.pg.query(
        'UPDATE auth_user SET email_verified = true WHERE id = $1',
        [req.user.id]
    )

    const session = await lucia.createSession(req.user.id, {})
    const cookie = lucia.createSessionCookie(session.id)

    reply.setCookie(cookie.name, cookie.value, cookie.attributes)

    return reply.status(300).send('Email successfully verified')
}

export async function requestEmailVerificationCode(
    req: FastifyRequest,
    reply: FastifyReply
) {
    const activeSesion = await getSession(req, reply)

    if (!req.user) return

    const alreadyVerified = (
        await req.server.pg.query(
            'SELECT email_verified FROM auth_user WHERE id = $1',
            [req.user.id]
        )
    ).rows[0].email_verified

    if (alreadyVerified) {
        return reply.conflict('Email already verified')
    }

    const verificationCode = await req.generateEmailVerificationCode(
        req.user?.id,
        req.user?.email
    )
    return reply.status(200).send({ message: 'Code saved' })
}

export async function resetPassword(req: FastifyRequest, reply: FastifyReply) {
    const activeSesion = await getSession(req, reply)

    if (!req.user) return

    const user = (
        await req.server.pg.query('SELECT * FROM auth_user WHERE id = $1', [
            req.user.id,
        ])
    ).rows[0]

    if (!user.email_verified) {
        return reply.expectationFailed('Email not verified')
    }

    const verificationToken = await req.createPasswordResetToken(user.id)
    const verificationLink =
        'http://localhost:3000/reset-password/' + verificationToken

    return reply.status(200).send({ message: 'Password reset token generated' })
}

export async function verifyPasswordResetToken(
    req: FastifyRequest<{ Body: VerifyPasswordResetTokenSchema }>,
    reply: FastifyReply
) {
    const activeSesion = await getSession(req, reply)

    if (!req.user) return

    const { password } = req.body

    const { token } = req.params as { token: string }

    const databaseToken = (
        await req.server.pg.query(
            'SELECT * FROM password_reset_token WHERE id = $1',
            [token]
        )
    ).rows[0]

    if (databaseToken) {
        await req.server.pg.query(
            'DELETE FROM password_reset_token WHERE id = $1',
            [token]
        )
    }

    if (!databaseToken || !isWithinExpirationDate(databaseToken.expires_at)) {
        return reply.notAcceptable('Invalid token')
    }

    await lucia.invalidateUserSessions(req.user.id)

    const hashedPassword = await new Argon2id().hash(password)
    await req.server.pg.query(
        'UPDATE auth_user SET password = $1 WHERE id = $2',
        [hashedPassword, req.user.id]
    )

    const session = await lucia.createSession(req.user.id, {})
    const cookie = lucia.createSessionCookie(session.id)
    reply.setCookie(cookie.name, cookie.value, cookie.attributes)

    return reply.status(200).send({ message: 'Password successfully reset' })
}

export async function createTwoFactor(
    req: FastifyRequest,
    reply: FastifyReply
) {
    const activeSesion = await getSession(req, reply)

    if (!req.user) return

    const twoFactorSecret = crypto.getRandomValues(new Uint8Array(20))

    await req.server.pg.query(
        'UPDATE two_factor_authorization_code SET code = $1 WHERE user_id = $2',
        [encodeHex(twoFactorSecret), req.user.id]
    )

    const uri = createTOTPKeyURI('archtika', req.user.email, twoFactorSecret)

    return reply.status(200).send({ uri })
}

export async function validateTwoFactor(
    req: FastifyRequest<{ Body: ValidateTwoFactorSchema }>,
    reply: FastifyReply
) {
    const activeSesion = await getSession(req, reply)

    if (!req.user) return

    const { otp } = req.body

    const twoFactorSecret = (
        await req.server.pg.query(
            'SELECT code FROM two_factor_authorization_code WHERE user_id = $1',
            [req.user.id]
        )
    ).rows[0].code
    const validOTP = await new TOTPController().verify(
        otp,
        decodeHex(twoFactorSecret)
    )

    if (validOTP)
        return reply
            .status(200)
            .send({ message: 'Two factor successfully validated' })
    else return reply.notAcceptable('Invalid OTP')
}

export async function loginWithGithub(
    req: FastifyRequest,
    reply: FastifyReply
) {
    const state = generateState()
    const url = await req.github.createAuthorizationURL(state, {
        scopes: ['user:email'],
    })

    reply.setCookie('github_oauth_state', state, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax',
    })

    return reply.redirect(url.toString())
}

export async function loginWithGithubCallback(
    req: FastifyRequest,
    reply: FastifyReply
) {
    const code = (req.query as any).code?.toString() ?? null
    const state = (req.query as any).state?.toString() ?? null
    const storedState =
        parseCookies(req.headers.cookie ?? '').get('github_oauth_state') ?? null

    if (!code || !state || state !== storedState) {
        return reply.unauthorized()
    }

    const tokens = await req.github.validateAuthorizationCode(code)
    const githubUserResponse = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
        },
    })
    const githubUserEmailsResponse = await fetch(
        'https://api.github.com/user/emails',
        {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        }
    )
    const githubUser = await githubUserResponse.json()
    const githubUserEmails = await githubUserEmailsResponse.json()

    const primaryEmail = githubUserEmails.find((email: any) => email.primary)

    if (!primaryEmail) {
        return reply.unauthorized('No primary email found')
    }

    if (!primaryEmail.verified) {
        return reply.unauthorized('Primary email not verified')
    }

    const existingUser = (
        await req.server.pg.query('SELECT * FROM auth_user WHERE email = $1', [
            primaryEmail.email,
        ])
    ).rows[0]

    if (existingUser) {
        const existingOauthAccount = await req.server.pg.query(
            'SELECT * FROM oauth_account WHERE provider_id = $1 AND provider_user_id = $2',
            ['github', githubUser.id]
        )

        if (!existingOauthAccount) {
            await req.server.pg.query(
                'INSERT INTO oauth_account (provider_id, provider_user_id, user_id) VALUES ($1, $2, $3)',
                ['github', githubUser.id, existingUser.id]
            )
        }

        const session = await lucia.createSession(existingUser.id, {})
        const cookie = lucia.createSessionCookie(session.id)

        reply.setCookie(cookie.name, cookie.value, cookie.attributes)

        return reply.redirect('/docs')
    }

    const userId = generateId(20)

    await req.server.pg.query(
        'INSERT INTO auth_user (id, username, email) VALUES ($1, $2, $3)',
        [userId, githubUser.login, primaryEmail.email]
    )
    await req.server.pg.query(
        'INSERT INTO oauth_account (provider_id, provider_user_id, user_id) VALUES ($1, $2, $3)',
        ['github', githubUser.id, userId]
    )

    const session = await lucia.createSession(userId, {})
    const cookie = lucia.createSessionCookie(session.id)

    reply.setCookie(cookie.name, cookie.value, cookie.attributes)

    return reply.redirect('/docs')
}

export async function loginWithGoogle(
    req: FastifyRequest,
    reply: FastifyReply
) {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const url = await req.google.createAuthorizationURL(state, codeVerifier, {
        scopes: ['profile', 'email'],
    })
    url.searchParams.set('access_type', 'offline')

    reply.setCookie('google_oauth_state', state, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax',
    })

    reply.setCookie('google_oauth_code_verifier', codeVerifier, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax',
    })

    return reply.redirect(url.toString())
}

export async function loginWithGoogleCallback(
    req: FastifyRequest,
    reply: FastifyReply
) {
    const code = (req.query as any).code?.toString() ?? null
    const state = (req.query as any).state?.toString() ?? null
    const storedState =
        parseCookies(req.headers.cookie ?? '').get('google_oauth_state') ?? null
    const codeVerifier =
        parseCookies(req.headers.cookie ?? '').get(
            'google_oauth_code_verifier'
        ) ?? null

    if (!code || !state || state !== storedState || !codeVerifier) {
        return reply.unauthorized()
    }

    const tokens = await req.google.validateAuthorizationCode(
        code,
        codeVerifier
    )

    const googleUserResponse = await fetch(
        'https://openidconnect.googleapis.com/v1/userinfo',
        {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        }
    )
    const googleUser = await googleUserResponse.json()

    if (!googleUser.email_verified) {
        return reply.unauthorized('Email not verified')
    }

    const existingUser = (
        await req.server.pg.query('SELECT * FROM auth_user WHERE email = $1', [
            googleUser.email,
        ])
    ).rows[0]

    if (existingUser) {
        const existingOauthAccount = await req.server.pg.query(
            'SELECT * FROM oauth_account WHERE provider_id = $1 AND provider_user_id = $2',
            ['google', googleUser.sub]
        )

        if (!existingOauthAccount) {
            await req.server.pg.query(
                'INSERT INTO oauth_account (provider_id, provider_user_id, user_id) VALUES ($1, $2, $3)',
                ['google', googleUser.sub, existingUser.id]
            )
        }

        const session = await lucia.createSession(existingUser.id, {})
        const cookie = lucia.createSessionCookie(session.id)

        reply.setCookie(cookie.name, cookie.value, cookie.attributes)

        return reply.redirect('/docs')
    }

    const userId = generateId(20)

    await req.server.pg.query(
        'INSERT INTO auth_user (id, username, email) VALUES ($1, $2, $3)',
        [userId, googleUser.name, googleUser.email]
    )
    await req.server.pg.query(
        'INSERT INTO oauth_account (provider_id, provider_user_id, user_id) VALUES ($1, $2, $3)',
        ['google', googleUser.sub, userId]
    )

    const session = await lucia.createSession(userId, {})
    const cookie = lucia.createSessionCookie(session.id)

    reply.setCookie(cookie.name, cookie.value, cookie.attributes)

    return reply.redirect('/docs')
}
