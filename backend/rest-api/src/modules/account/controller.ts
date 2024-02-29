import { FastifyRequest, FastifyReply } from 'fastify'
import { generateId } from 'lucia'
import { generateCodeVerifier, generateState } from 'arctic'
import {
    findExistingUserQuery,
    findExistingOAuthAccountQuery,
    createUserQuery,
    createOAuthAccountQuery
} from './queries.js'

export async function viewAccountInformation(
    req: FastifyRequest,
    reply: FastifyReply
) {
    await req.server.lucia.getSession(req, reply)

    const user = (
        await findExistingUserQuery.run(
            { email: 'thilo.hohlt@tutanota.com' },
            req.server.pg.pool
        )
    )[0]

    return reply.send({ user })
}

export async function loginWithGithub(
    req: FastifyRequest,
    reply: FastifyReply
) {
    const state = generateState()
    const url = await req.server.lucia.oAuth.github.createAuthorizationURL(
        state,
        {
            scopes: ['user:email']
        }
    )

    reply.setCookie('github_oauth_state', state, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax'
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

    const tokens =
        await req.server.lucia.oAuth.github.validateAuthorizationCode(code)
    const githubUserResponse = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${tokens.accessToken}`
        }
    })
    const githubUserEmailsResponse = await fetch(
        'https://api.github.com/user/emails',
        {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
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
        await findExistingUserQuery.run(
            { email: primaryEmail.email },
            req.server.pg.pool
        )
    )[0]

    if (existingUser) {
        const existingOauthAccount = (
            await findExistingOAuthAccountQuery.run(
                {
                    providerId: 'github',
                    providerUserId: githubUser.id
                },
                req.server.pg.pool
            )
        )[0]

        if (!existingOauthAccount) {
            await createOAuthAccountQuery.run(
                {
                    oAuthAccount: {
                        providerId: 'github',
                        providerUserId: githubUser.id,
                        userId: existingUser.id
                    }
                },
                req.server.pg.pool
            )
        }

        const session = await req.server.lucia.luciaInstance.createSession(
            existingUser.id,
            {}
        )
        const cookie = req.server.lucia.luciaInstance.createSessionCookie(
            session.id
        )

        reply.setCookie(cookie.name, cookie.value, cookie.attributes)

        return reply.redirect('/docs')
    }

    const userId = generateId(20)

    await createUserQuery.run(
        {
            user: {
                id: userId,
                username: githubUser.login,
                email: primaryEmail.email
            }
        },
        req.server.pg.pool
    )
    await createOAuthAccountQuery.run(
        {
            oAuthAccount: {
                providerId: 'github',
                providerUserId: githubUser.id,
                userId: userId
            }
        },
        req.server.pg.pool
    )

    const session = await req.server.lucia.luciaInstance.createSession(
        userId,
        {}
    )
    const cookie = req.server.lucia.luciaInstance.createSessionCookie(
        session.id
    )

    reply.setCookie(cookie.name, cookie.value, cookie.attributes)

    return reply.redirect('/docs')
}

export async function loginWithGoogle(
    req: FastifyRequest,
    reply: FastifyReply
) {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const url = await req.server.lucia.oAuth.google.createAuthorizationURL(
        state,
        codeVerifier,
        {
            scopes: ['profile', 'email']
        }
    )
    url.searchParams.set('access_type', 'offline')

    reply.setCookie('google_oauth_state', state, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax'
    })

    reply.setCookie('google_oauth_code_verifier', codeVerifier, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax'
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

    const tokens =
        await req.server.lucia.oAuth.google.validateAuthorizationCode(
            code,
            codeVerifier
        )

    const googleUserResponse = await fetch(
        'https://openidconnect.googleapis.com/v1/userinfo',
        {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
        }
    )
    const googleUser = await googleUserResponse.json()

    if (!googleUser.email_verified) {
        return reply.unauthorized('Email not verified')
    }

    const existingUser = (
        await findExistingUserQuery.run(
            { email: googleUser.email },
            req.server.pg.pool
        )
    )[0]

    if (existingUser) {
        const existingOauthAccount = (
            await findExistingOAuthAccountQuery.run(
                {
                    providerId: 'google',
                    providerUserId: googleUser.sub
                },
                req.server.pg.pool
            )
        )[0]

        if (!existingOauthAccount) {
            await createOAuthAccountQuery.run(
                {
                    oAuthAccount: {
                        providerId: 'google',
                        providerUserId: googleUser.sub,
                        userId: existingUser.id
                    }
                },
                req.server.pg.pool
            )
        }

        const session = await req.server.lucia.luciaInstance.createSession(
            existingUser.id,
            {}
        )
        const cookie = req.server.lucia.luciaInstance.createSessionCookie(
            session.id
        )

        reply.setCookie(cookie.name, cookie.value, cookie.attributes)

        return reply.redirect('/docs')
    }

    const userId = generateId(20)

    await createUserQuery.run(
        {
            user: {
                id: userId,
                username: googleUser.name,
                email: googleUser.email
            }
        },
        req.server.pg.pool
    )
    await createOAuthAccountQuery.run(
        {
            oAuthAccount: {
                providerId: 'google',
                providerUserId: googleUser.sub,
                userId: userId
            }
        },
        req.server.pg.pool
    )

    const session = await req.server.lucia.luciaInstance.createSession(
        userId,
        {}
    )
    const cookie = req.server.lucia.luciaInstance.createSessionCookie(
        session.id
    )

    reply.setCookie(cookie.name, cookie.value, cookie.attributes)

    return reply.redirect('/docs')
}

export async function logout(req: FastifyRequest, reply: FastifyReply) {
    if (!req.session) {
        return reply.unauthorized()
    }

    await req.server.lucia.luciaInstance.invalidateSession(req.session.id)

    const cookie = req.server.lucia.luciaInstance.createBlankSessionCookie()
    reply.setCookie(cookie.name, cookie.value, cookie.attributes)

    return reply.status(200).send({ message: 'Successfully logged out' })
}

export async function deleteAccount(req: FastifyRequest, reply: FastifyReply) {
    console.log('test')
}
