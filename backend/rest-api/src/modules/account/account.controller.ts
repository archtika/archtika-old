import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import * as argon2 from 'argon2'
import { CreateAccountSchema, LoginSchema } from './account.schema.js'
import { fastify } from '../../index.js'

export async function createAccount(
  req: FastifyRequest<{ Body: CreateAccountSchema }>,
  reply: FastifyReply
) {
  const { username, email, password } = req.body

  const existingAccount = (await fastify.pg.query(
    'SELECT * FROM account WHERE username = $1 OR email = $2',
    [username, email]
  )).rows[0];
  if (existingAccount) {
    return reply.code(401).send({
      message: 'An account with that username or email already exists'
    })
  }

  try {
    const hashedPassword = await argon2.hash(password)
    const account = (await fastify.pg.query(
      'INSERT INTO account (username, email, password_hash) VALUES ($1, $2, $3) RETURNING account_id, username, email',
      [username, email, hashedPassword]
    )).rows[0]
    return reply.code(201).send(account)
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
    'SELECT * FROM account WHERE email = $1',
    [email]
  )).rows[0]

  const isValid = account && await argon2.verify(account.password_hash, password)
  if (!isValid) {
    return reply.code(401).send({
      message: 'Invalid email or password'
    })
  }

  const payload = {
    account_id: account.account_id,
    username: account.username,
    email: account.email
  }
  const token = req.jwt.sign(payload)

  reply.setCookie('access_token', token, {
    path: '/',
    httpOnly: true,
    secure: true
  })

  return { access_token: token }
}