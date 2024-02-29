/** Types generated for queries found in "src/modules/account/queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime'

/** 'FindExistingUser' parameters type */
export interface IFindExistingUserParams {
    email?: string | null | void
}

/** 'FindExistingUser' return type */
export interface IFindExistingUserResult {
    email: string
    id: string
    username: string
}

/** 'FindExistingUser' query type */
export interface IFindExistingUserQuery {
    params: IFindExistingUserParams
    result: IFindExistingUserResult
}

const findExistingUserIR: any = {
    usedParamSet: { email: true },
    params: [
        {
            name: 'email',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 38, b: 43 }]
        }
    ],
    statement: 'SELECT * FROM auth_user WHERE email = :email'
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM auth_user WHERE email = :email
 * ```
 */
export const findExistingUser = new PreparedQuery<
    IFindExistingUserParams,
    IFindExistingUserResult
>(findExistingUserIR)

/** 'FindExistingOAuthAccount' parameters type */
export interface IFindExistingOAuthAccountParams {
    providerId?: string | null | void
    providerUserId?: string | null | void
}

/** 'FindExistingOAuthAccount' return type */
export interface IFindExistingOAuthAccountResult {
    provider_id: string
    provider_user_id: string
    user_id: string
}

/** 'FindExistingOAuthAccount' query type */
export interface IFindExistingOAuthAccountQuery {
    params: IFindExistingOAuthAccountParams
    result: IFindExistingOAuthAccountResult
}

const findExistingOAuthAccountIR: any = {
    usedParamSet: { providerId: true, providerUserId: true },
    params: [
        {
            name: 'providerId',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 48, b: 58 }]
        },
        {
            name: 'providerUserId',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 83, b: 97 }]
        }
    ],
    statement:
        'SELECT * FROM oauth_account WHERE provider_id = :providerId AND provider_user_id = :providerUserId'
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM oauth_account WHERE provider_id = :providerId AND provider_user_id = :providerUserId
 * ```
 */
export const findExistingOAuthAccount = new PreparedQuery<
    IFindExistingOAuthAccountParams,
    IFindExistingOAuthAccountResult
>(findExistingOAuthAccountIR)

/** 'CreateUser' parameters type */
export interface ICreateUserParams {
    email?: string | null | void
    id?: string | null | void
    username?: string | null | void
}

/** 'CreateUser' return type */
export type ICreateUserResult = void

/** 'CreateUser' query type */
export interface ICreateUserQuery {
    params: ICreateUserParams
    result: ICreateUserResult
}

const createUserIR: any = {
    usedParamSet: { id: true, username: true, email: true },
    params: [
        {
            name: 'id',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 52, b: 54 }]
        },
        {
            name: 'username',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 57, b: 65 }]
        },
        {
            name: 'email',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 68, b: 73 }]
        }
    ],
    statement:
        'INSERT INTO auth_user (id, username, email) VALUES (:id, :username, :email)'
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO auth_user (id, username, email) VALUES (:id, :username, :email)
 * ```
 */
export const createUser = new PreparedQuery<
    ICreateUserParams,
    ICreateUserResult
>(createUserIR)

/** 'CreateOAuthAccount' parameters type */
export interface ICreateOAuthAccountParams {
    providerId?: string | null | void
    providerUserId?: string | null | void
    userId?: string | null | void
}

/** 'CreateOAuthAccount' return type */
export type ICreateOAuthAccountResult = void

/** 'CreateOAuthAccount' query type */
export interface ICreateOAuthAccountQuery {
    params: ICreateOAuthAccountParams
    result: ICreateOAuthAccountResult
}

const createOAuthAccountIR: any = {
    usedParamSet: { providerId: true, providerUserId: true, userId: true },
    params: [
        {
            name: 'providerId',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 75, b: 85 }]
        },
        {
            name: 'providerUserId',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 88, b: 102 }]
        },
        {
            name: 'userId',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 105, b: 111 }]
        }
    ],
    statement:
        'INSERT INTO oauth_account (provider_id, provider_user_id, user_id) VALUES (:providerId, :providerUserId, :userId)'
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO oauth_account (provider_id, provider_user_id, user_id) VALUES (:providerId, :providerUserId, :userId)
 * ```
 */
export const createOAuthAccount = new PreparedQuery<
    ICreateOAuthAccountParams,
    ICreateOAuthAccountResult
>(createOAuthAccountIR)
