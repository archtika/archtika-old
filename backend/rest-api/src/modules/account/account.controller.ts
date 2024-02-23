import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateAccountSchema, EmailVerificationSchema, LoginSchema, VerifyPasswordResetTokenSchema } from './account.schema.js'
import { fastify } from '../../index.js'
import { Argon2id } from 'oslo/password';
import { lucia } from '../../plugins/lucia.js';
import { generateId } from 'lucia';
import { generateEmailVerificationCode, verifyVerificationCode } from '../../utils/email-verification.js';
import { getSession } from '../../utils/getSession.js';
import { createPasswordResetToken } from '../../utils/password-reset.js';
import { isWithinExpirationDate } from 'oslo';

export async function createAccount(
  req: FastifyRequest<{ Body: CreateAccountSchema }>,
  reply: FastifyReply
) {
  const { username, email, password } = req.body

  const existingAccount = (await fastify.pg.query(
    'SELECT * FROM auth_user WHERE username = $1 OR email = $2',
    [username, email]
  )).rows[0];
  if (existingAccount) {
    return reply.conflict()
  }

  const hashedPassword = await new Argon2id().hash(password)
  const userId = generateId(20)

  try {
    const account = (await fastify.pg.query(
      'INSERT INTO auth_user (id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
      [userId, username, email, hashedPassword]
    )).rows[0]

    const session = await lucia.createSession(userId, {})
    const cookie = lucia.createSessionCookie(session.id)

    reply.setCookie(cookie.name, cookie.value, cookie.attributes)

    return reply.code(201).send({
      account_id: account.id,
      username,
      email
    })
  } catch (err) {
    return reply.internalServerError()
  }
}

export async function login(
  req: FastifyRequest<{ Body: LoginSchema }>,
  reply: FastifyReply
) {
  const { email, password } = req.body

  const account = (await fastify.pg.query(
    'SELECT * FROM auth_user WHERE email = $1',
    [email]
  )).rows[0]

  if (!account) {
    return reply.badRequest()
  }

  const validPassword = await new Argon2id().verify(account.password, password)
  if (!validPassword) {
    return reply.badRequest()
  }

  const session = await lucia.createSession(account.id, {})
  const cookie = lucia.createSessionCookie(session.id)

  reply.setCookie(cookie.name, cookie.value, cookie.attributes)

  reply.status(302).send({ message: 'Successfully logged in' })
}

export async function logout(
  req: FastifyRequest,
  reply: FastifyReply
) {
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

  const validCode = await verifyVerificationCode(req.user, code)
  
  if (!validCode) {
    return reply.notAcceptable()
  }

  await lucia.invalidateUserSessions(req.user.id)
  await fastify.pg.query(
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

  const alreadyVerified = (await fastify.pg.query(
    'SELECT email_verified FROM auth_user WHERE id = $1',
    [req.user.id]
  )).rows[0].email_verified

  if (alreadyVerified) {
    return reply.conflict('Email already verified')
  }

  const verificationCode = await generateEmailVerificationCode(req.user?.id, req.user?.email)
  return reply.status(200).send({ message: 'Code saved'})
}

export async function resetPassword(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const activeSesion = await getSession(req, reply)

  if (!req.user) return

  const user = (await fastify.pg.query(
    'SELECT * FROM auth_user WHERE id = $1',
    [req.user.id]
  )).rows[0]

  if (!user.email_verified) {
    return reply.expectationFailed('Email not verified')
  }

  const verificationToken = await createPasswordResetToken(user.id)
  const verificationLink = 'http://localhost:3000/reset-password/' + verificationToken

  return reply.status(200).send({ message: 'Password reset token generated' })
}

export async function verifyPasswordResetToken(
  req: FastifyRequest<{ Body: VerifyPasswordResetTokenSchema }>,
  reply: FastifyReply
) {
  const activeSesion = await getSession(req, reply)

  if (!req.user) return

  const { password } = req.body

  const { token } = req.params

  const databaseToken = (await fastify.pg.query(
    'SELECT * FROM password_reset_token WHERE id = $1',
    [token]
  )).rows[0]

  if (databaseToken) {
    await fastify.pg.query(
      'DELETE FROM password_reset_token WHERE id = $1',
      [token]
    )
  }

  if (!databaseToken || !isWithinExpirationDate(databaseToken.expires_at)) {
    return reply.notAcceptable('Invalid token')
  }

  await lucia.invalidateUserSessions(req.user.id)

  const hashedPassword = await new Argon2id().hash(password)
  await fastify.pg.query(
    'UPDATE auth_user SET password = $1 WHERE id = $2',
    [hashedPassword, req.user.id]
  )

  const session = await lucia.createSession(req.user.id, {})
  const cookie = lucia.createSessionCookie(session.id)
  reply.setCookie(cookie.name, cookie.value, cookie.attributes)

  return reply.status(200).send({ message: 'Password successfully reset' })
}