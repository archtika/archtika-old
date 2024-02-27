import { FastifyRequest, FastifyReply } from 'fastify'
import { lucia } from '../../plugins/lucia.js'
import { generateId } from 'lucia'
import { generateCodeVerifier, generateState } from 'arctic'

export async function loginWithGithub(
    req: FastifyRequest,
    reply: FastifyReply
) {
    const state = generateState()
    const url = await req.server.oAuth.github.createAuthorizationURL(state, {
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
    const storedState = req.cookies['github_oauth_state']

    if (!code || !state || state !== storedState) {
        return reply.unauthorized()
    }

    const tokens = await req.server.oAuth.github.validateAuthorizationCode(code)
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
        const existingOauthAccount = (
            await req.server.pg.query(
                'SELECT * FROM oauth_account WHERE provider_id = $1 AND provider_user_id = $2',
                ['github', githubUser.id]
            )
        ).rows[0]

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
    const url = await req.server.oAuth.google.createAuthorizationURL(
        state,
        codeVerifier,
        {
            scopes: ['profile', 'email'],
        }
    )
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
    const storedState = req.cookies['google_oauth_state']
    const codeVerifier = req.cookies['google_oauth_code_verifier']

    if (!code || !state || state !== storedState || !codeVerifier) {
        return reply.unauthorized()
    }

    const tokens = await req.server.oAuth.google.validateAuthorizationCode(
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
        const existingOauthAccount = (
            await req.server.pg.query(
                'SELECT * FROM oauth_account WHERE provider_id = $1 AND provider_user_id = $2',
                ['google', googleUser.sub]
            )
        ).rows[0]

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

export async function logout(req: FastifyRequest, reply: FastifyReply) {
    if (!req.session) {
        return reply.unauthorized()
    }

    await lucia.invalidateSession(req.session.id)

    const cookie = lucia.createBlankSessionCookie()
    reply.setCookie(cookie.name, cookie.value, cookie.attributes)

    return reply.status(200).send({ message: 'Successfully logged out' })
}
