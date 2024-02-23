import { FastifyRequest, FastifyReply } from 'fastify'
import { CreateAccountSchema, LoginSchema } from './account.schema.js'
import { fastify } from '../../index.js'
import { Argon2id } from 'oslo/password';
import { lucia } from '../../utils/lucia.js';
import { generateId } from 'lucia';

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
    return reply.code(401).send({
      message: 'A user with that username or email already exists'
    })
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
    return reply.code(500).send(err)
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
    return reply.code(400).send({ message: 'Invalid email or password' })
  }

  const validPassword = await new Argon2id().verify(account.password, password)
  if (!validPassword) {
    return reply.code(400).send({ message: 'Invalid email or password' })
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
    return reply.status(401).send({ message: 'Not logged in' })
  }
  
  await lucia.invalidateSession(req.session.id)

  const cookie = lucia.createBlankSessionCookie()
  reply.setCookie(cookie.name, cookie.value, cookie.attributes)

  return reply.status(200).send({ message: 'Successfully logged out' })
}