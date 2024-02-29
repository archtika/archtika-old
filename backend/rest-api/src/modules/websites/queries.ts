/** Types generated for queries found in "src/modules/websites/queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime'

/** 'CreateWebsiteQuery' parameters type */
export interface ICreateWebsiteQueryParams {
    website: {
        userId: string
        title: string
        meta_description: string | null | void
    }
}

/** 'CreateWebsiteQuery' return type */
export type ICreateWebsiteQueryResult = void

/** 'CreateWebsiteQuery' query type */
export interface ICreateWebsiteQueryQuery {
    params: ICreateWebsiteQueryParams
    result: ICreateWebsiteQueryResult
}

const createWebsiteQueryIR: any = {
    usedParamSet: { website: true },
    params: [
        {
            name: 'website',
            required: false,
            transform: {
                type: 'pick_tuple',
                keys: [
                    { name: 'userId', required: true },
                    { name: 'title', required: true },
                    { name: 'meta_description', required: false }
                ]
            },
            locs: [{ a: 62, b: 69 }]
        }
    ],
    statement:
        'INSERT INTO website (user_id, title, meta_description) VALUES :website'
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO website (user_id, title, meta_description) VALUES :website
 * ```
 */
export const createWebsiteQuery = new PreparedQuery<
    ICreateWebsiteQueryParams,
    ICreateWebsiteQueryResult
>(createWebsiteQueryIR)

/** 'FindAllWebsitesQuery' parameters type */
export interface IFindAllWebsitesQueryParams {
    userId: string
}

/** 'FindAllWebsitesQuery' return type */
export interface IFindAllWebsitesQueryResult {
    created_at: Date
    id: number
    meta_description: string | null
    title: string
    updated_at: Date | null
    user_id: string
}

/** 'FindAllWebsitesQuery' query type */
export interface IFindAllWebsitesQueryQuery {
    params: IFindAllWebsitesQueryParams
    result: IFindAllWebsitesQueryResult
}

const findAllWebsitesQueryIR: any = {
    usedParamSet: { userId: true },
    params: [
        {
            name: 'userId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 38, b: 45 }]
        }
    ],
    statement: 'SELECT * FROM website WHERE user_id = :userId!'
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM website WHERE user_id = :userId!
 * ```
 */
export const findAllWebsitesQuery = new PreparedQuery<
    IFindAllWebsitesQueryParams,
    IFindAllWebsitesQueryResult
>(findAllWebsitesQueryIR)

/** 'FindWebsiteByIdQuery' parameters type */
export interface IFindWebsiteByIdQueryParams {
    id: number
    userId: string
}

/** 'FindWebsiteByIdQuery' return type */
export interface IFindWebsiteByIdQueryResult {
    created_at: Date
    id: number
    meta_description: string | null
    title: string
    updated_at: Date | null
    user_id: string
}

/** 'FindWebsiteByIdQuery' query type */
export interface IFindWebsiteByIdQueryQuery {
    params: IFindWebsiteByIdQueryParams
    result: IFindWebsiteByIdQueryResult
}

const findWebsiteByIdQueryIR: any = {
    usedParamSet: { id: true, userId: true },
    params: [
        {
            name: 'id',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 33, b: 36 }]
        },
        {
            name: 'userId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 52, b: 59 }]
        }
    ],
    statement: 'SELECT * FROM website WHERE id = :id! AND user_id = :userId!'
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM website WHERE id = :id! AND user_id = :userId!
 * ```
 */
export const findWebsiteByIdQuery = new PreparedQuery<
    IFindWebsiteByIdQueryParams,
    IFindWebsiteByIdQueryResult
>(findWebsiteByIdQueryIR)

/** 'UpdateWebsiteQuery' parameters type */
export interface IUpdateWebsiteQueryParams {
    id: number
    metaDescription?: string | null | void
    title?: string | null | void
    userId: string
}

/** 'UpdateWebsiteQuery' return type */
export type IUpdateWebsiteQueryResult = void

/** 'UpdateWebsiteQuery' query type */
export interface IUpdateWebsiteQueryQuery {
    params: IUpdateWebsiteQueryParams
    result: IUpdateWebsiteQueryResult
}

const updateWebsiteQueryIR: any = {
    usedParamSet: {
        title: true,
        metaDescription: true,
        id: true,
        userId: true
    },
    params: [
        {
            name: 'title',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 27, b: 32 }]
        },
        {
            name: 'metaDescription',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 54, b: 69 }]
        },
        {
            name: 'id',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 82, b: 85 }]
        },
        {
            name: 'userId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 101, b: 108 }]
        }
    ],
    statement:
        'UPDATE website SET title = :title, meta_description = :metaDescription WHERE id = :id! AND user_id = :userId!'
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE website SET title = :title, meta_description = :metaDescription WHERE id = :id! AND user_id = :userId!
 * ```
 */
export const updateWebsiteQuery = new PreparedQuery<
    IUpdateWebsiteQueryParams,
    IUpdateWebsiteQueryResult
>(updateWebsiteQueryIR)

/** 'DeleteWebsiteQuery' parameters type */
export interface IDeleteWebsiteQueryParams {
    id: number
    userId: string
}

/** 'DeleteWebsiteQuery' return type */
export type IDeleteWebsiteQueryResult = void

/** 'DeleteWebsiteQuery' query type */
export interface IDeleteWebsiteQueryQuery {
    params: IDeleteWebsiteQueryParams
    result: IDeleteWebsiteQueryResult
}

const deleteWebsiteQueryIR: any = {
    usedParamSet: { id: true, userId: true },
    params: [
        {
            name: 'id',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 31, b: 34 }]
        },
        {
            name: 'userId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 50, b: 57 }]
        }
    ],
    statement: 'DELETE FROM website WHERE id = :id! AND user_id = :userId!'
}

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM website WHERE id = :id! AND user_id = :userId!
 * ```
 */
export const deleteWebsiteQuery = new PreparedQuery<
    IDeleteWebsiteQueryParams,
    IDeleteWebsiteQueryResult
>(deleteWebsiteQueryIR)
