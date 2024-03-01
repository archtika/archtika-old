/** Types generated for queries found in "src/modules/websites/pages/queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime'

/** 'CreatePageQuery' parameters type */
export interface ICreatePageQueryParams {
    page: {
        websiteId: number
        route: string
        title: string | null | void
        metaDescription: string | null | void
    }
}

/** 'CreatePageQuery' return type */
export type ICreatePageQueryResult = void

/** 'CreatePageQuery' query type */
export interface ICreatePageQueryQuery {
    params: ICreatePageQueryParams
    result: ICreatePageQueryResult
}

const createPageQueryIR: any = {
    usedParamSet: { page: true },
    params: [
        {
            name: 'page',
            required: false,
            transform: {
                type: 'pick_tuple',
                keys: [
                    { name: 'websiteId', required: true },
                    { name: 'route', required: true },
                    { name: 'title', required: false },
                    { name: 'metaDescription', required: false }
                ]
            },
            locs: [{ a: 87, b: 91 }]
        }
    ],
    statement:
        'INSERT INTO website_structure.page (website_id, route, title, meta_description) VALUES :page'
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO website_structure.page (website_id, route, title, meta_description) VALUES :page
 * ```
 */
export const createPageQuery = new PreparedQuery<
    ICreatePageQueryParams,
    ICreatePageQueryResult
>(createPageQueryIR)

/** 'FindAllPagesQuery' parameters type */
export interface IFindAllPagesQueryParams {
    websiteId: number
}

/** 'FindAllPagesQuery' return type */
export interface IFindAllPagesQueryResult {
    created_at: Date
    id: number
    meta_description: string | null
    route: string
    title: string | null
    updated_at: Date | null
    website_id: number
}

/** 'FindAllPagesQuery' query type */
export interface IFindAllPagesQueryQuery {
    params: IFindAllPagesQueryParams
    result: IFindAllPagesQueryResult
}

const findAllPagesQueryIR: any = {
    usedParamSet: { websiteId: true },
    params: [
        {
            name: 'websiteId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 56, b: 66 }]
        }
    ],
    statement:
        'SELECT * FROM website_structure.page WHERE website_id = :websiteId!'
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM website_structure.page WHERE website_id = :websiteId!
 * ```
 */
export const findAllPagesQuery = new PreparedQuery<
    IFindAllPagesQueryParams,
    IFindAllPagesQueryResult
>(findAllPagesQueryIR)

/** 'FindPageByIdQuery' parameters type */
export interface IFindPageByIdQueryParams {
    id: number
    websiteId: number
}

/** 'FindPageByIdQuery' return type */
export interface IFindPageByIdQueryResult {
    created_at: Date
    id: number
    meta_description: string | null
    route: string
    title: string | null
    updated_at: Date | null
    website_id: number
}

/** 'FindPageByIdQuery' query type */
export interface IFindPageByIdQueryQuery {
    params: IFindPageByIdQueryParams
    result: IFindPageByIdQueryResult
}

const findPageByIdQueryIR: any = {
    usedParamSet: { id: true, websiteId: true },
    params: [
        {
            name: 'id',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 48, b: 51 }]
        },
        {
            name: 'websiteId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 70, b: 80 }]
        }
    ],
    statement:
        'SELECT * FROM website_structure.page WHERE id = :id! AND website_id = :websiteId!'
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM website_structure.page WHERE id = :id! AND website_id = :websiteId!
 * ```
 */
export const findPageByIdQuery = new PreparedQuery<
    IFindPageByIdQueryParams,
    IFindPageByIdQueryResult
>(findPageByIdQueryIR)

/** 'UpdatePageQuery' parameters type */
export interface IUpdatePageQueryParams {
    id: number
    metaDescription?: string | null | void
    route?: string | null | void
    title?: string | null | void
    websiteId: number
}

/** 'UpdatePageQuery' return type */
export type IUpdatePageQueryResult = void

/** 'UpdatePageQuery' query type */
export interface IUpdatePageQueryQuery {
    params: IUpdatePageQueryParams
    result: IUpdatePageQueryResult
}

const updatePageQueryIR: any = {
    usedParamSet: {
        route: true,
        title: true,
        metaDescription: true,
        id: true,
        websiteId: true
    },
    params: [
        {
            name: 'route',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 51, b: 56 }]
        },
        {
            name: 'title',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 84, b: 89 }]
        },
        {
            name: 'metaDescription',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 128, b: 143 }]
        },
        {
            name: 'id',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 175, b: 178 }]
        },
        {
            name: 'websiteId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 197, b: 207 }]
        }
    ],
    statement:
        'UPDATE website_structure.page SET route = COALESCE(:route, route), title = COALESCE(:title, title), meta_description = COALESCE(:metaDescription, meta_description) WHERE id = :id! AND website_id = :websiteId!'
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE website_structure.page SET route = COALESCE(:route, route), title = COALESCE(:title, title), meta_description = COALESCE(:metaDescription, meta_description) WHERE id = :id! AND website_id = :websiteId!
 * ```
 */
export const updatePageQuery = new PreparedQuery<
    IUpdatePageQueryParams,
    IUpdatePageQueryResult
>(updatePageQueryIR)

/** 'DeletePageQuery' parameters type */
export interface IDeletePageQueryParams {
    id: number
    websiteId: number
}

/** 'DeletePageQuery' return type */
export type IDeletePageQueryResult = void

/** 'DeletePageQuery' query type */
export interface IDeletePageQueryQuery {
    params: IDeletePageQueryParams
    result: IDeletePageQueryResult
}

const deletePageQueryIR: any = {
    usedParamSet: { id: true, websiteId: true },
    params: [
        {
            name: 'id',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 46, b: 49 }]
        },
        {
            name: 'websiteId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 68, b: 78 }]
        }
    ],
    statement:
        'DELETE FROM website_structure.page WHERE id = :id! AND website_id = :websiteId!'
}

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM website_structure.page WHERE id = :id! AND website_id = :websiteId!
 * ```
 */
export const deletePageQuery = new PreparedQuery<
    IDeletePageQueryParams,
    IDeletePageQueryResult
>(deletePageQueryIR)
