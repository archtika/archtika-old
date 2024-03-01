/** Types generated for queries found in "src/modules/account/queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime'

/** 'FindExistingUserQuery' parameters type */
export interface IFindExistingUserQueryParams {
    email: string
}

/** 'FindExistingUserQuery' return type */
export interface IFindExistingUserQueryResult {
    email: string
    id: string
    username: string
}

/** 'FindExistingUserQuery' query type */
export interface IFindExistingUserQueryQuery {
    params: IFindExistingUserQueryParams
    result: IFindExistingUserQueryResult
}

const findExistingUserQueryIR: any = {
    usedParamSet: { email: true },
    params: [
        {
            name: 'email',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 43, b: 49 }]
        }
    ],
    statement: 'SELECT * FROM auth.auth_user WHERE email = :email!'
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM auth.auth_user WHERE email = :email!
 * ```
 */
export const findExistingUserQuery = new PreparedQuery<
    IFindExistingUserQueryParams,
    IFindExistingUserQueryResult
>(findExistingUserQueryIR)

/** 'FindExistingOAuthAccountQuery' parameters type */
export interface IFindExistingOAuthAccountQueryParams {
    providerId: string
    providerUserId: string
}

/** 'FindExistingOAuthAccountQuery' return type */
export interface IFindExistingOAuthAccountQueryResult {
    provider_id: string
    provider_user_id: string
    user_id: string
}

/** 'FindExistingOAuthAccountQuery' query type */
export interface IFindExistingOAuthAccountQueryQuery {
    params: IFindExistingOAuthAccountQueryParams
    result: IFindExistingOAuthAccountQueryResult
}

const findExistingOAuthAccountQueryIR: any = {
    usedParamSet: { providerId: true, providerUserId: true },
    params: [
        {
            name: 'providerId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 53, b: 64 }]
        },
        {
            name: 'providerUserId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 89, b: 104 }]
        }
    ],
    statement:
        'SELECT * FROM auth.oauth_account WHERE provider_id = :providerId! AND provider_user_id = :providerUserId!'
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM auth.oauth_account WHERE provider_id = :providerId! AND provider_user_id = :providerUserId!
 * ```
 */
export const findExistingOAuthAccountQuery = new PreparedQuery<
    IFindExistingOAuthAccountQueryParams,
    IFindExistingOAuthAccountQueryResult
>(findExistingOAuthAccountQueryIR)

/** 'CreateUserQuery' parameters type */
export interface ICreateUserQueryParams {
    user: {
        id: string | null | void
        username: string | null | void
        email: string | null | void
    }
}

/** 'CreateUserQuery' return type */
export type ICreateUserQueryResult = void

/** 'CreateUserQuery' query type */
export interface ICreateUserQueryQuery {
    params: ICreateUserQueryParams
    result: ICreateUserQueryResult
}

const createUserQueryIR: any = {
    usedParamSet: { user: true },
    params: [
        {
            name: 'user',
            required: false,
            transform: {
                type: 'pick_tuple',
                keys: [
                    { name: 'id', required: false },
                    { name: 'username', required: false },
                    { name: 'email', required: false }
                ]
            },
            locs: [{ a: 56, b: 60 }]
        }
    ],
    statement: 'INSERT INTO auth.auth_user (id, username, email) VALUES :user'
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO auth.auth_user (id, username, email) VALUES :user
 * ```
 */
export const createUserQuery = new PreparedQuery<
    ICreateUserQueryParams,
    ICreateUserQueryResult
>(createUserQueryIR)

/** 'CreateOAuthAccountQuery' parameters type */
export interface ICreateOAuthAccountQueryParams {
    oAuthAccount: {
        providerId: string | null | void
        providerUserId: string | null | void
        userId: string | null | void
    }
}

/** 'CreateOAuthAccountQuery' return type */
export type ICreateOAuthAccountQueryResult = void

/** 'CreateOAuthAccountQuery' query type */
export interface ICreateOAuthAccountQueryQuery {
    params: ICreateOAuthAccountQueryParams
    result: ICreateOAuthAccountQueryResult
}

const createOAuthAccountQueryIR: any = {
    usedParamSet: { oAuthAccount: true },
    params: [
        {
            name: 'oAuthAccount',
            required: false,
            transform: {
                type: 'pick_tuple',
                keys: [
                    { name: 'providerId', required: false },
                    { name: 'providerUserId', required: false },
                    { name: 'userId', required: false }
                ]
            },
            locs: [{ a: 79, b: 91 }]
        }
    ],
    statement:
        'INSERT INTO auth.oauth_account (provider_id, provider_user_id, user_id) VALUES :oAuthAccount'
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO auth.oauth_account (provider_id, provider_user_id, user_id) VALUES :oAuthAccount
 * ```
 */
export const createOAuthAccountQuery = new PreparedQuery<
    ICreateOAuthAccountQueryParams,
    ICreateOAuthAccountQueryResult
>(createOAuthAccountQueryIR)
