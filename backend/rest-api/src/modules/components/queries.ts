/** Types generated for queries found in "src/modules/components/queries.sql" */
import { PreparedQuery } from '@pgtyped/runtime'

export type component_type =
    | 'accordion'
    | 'audio'
    | 'button'
    | 'image'
    | 'text'
    | 'video'

export type Json =
    | null
    | boolean
    | number
    | string
    | Json[]
    | { [key: string]: Json }

/** 'CreateComponentQuery' parameters type */
export interface ICreateComponentQueryParams {
    component: {
        type: component_type
        pageId: number
        content: Json
        assetId: number | null | void
    }
}

/** 'CreateComponentQuery' return type */
export type ICreateComponentQueryResult = void

/** 'CreateComponentQuery' query type */
export interface ICreateComponentQueryQuery {
    params: ICreateComponentQueryParams
    result: ICreateComponentQueryResult
}

const createComponentQueryIR: any = {
    usedParamSet: { component: true },
    params: [
        {
            name: 'component',
            required: false,
            transform: {
                type: 'pick_tuple',
                keys: [
                    { name: 'type', required: true },
                    { name: 'pageId', required: true },
                    { name: 'content', required: true },
                    { name: 'assetId', required: false }
                ]
            },
            locs: [{ a: 75, b: 84 }]
        }
    ],
    statement:
        'INSERT INTO components.component (type, page_id, content, asset_id) VALUES :component'
}

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO components.component (type, page_id, content, asset_id) VALUES :component
 * ```
 */
export const createComponentQuery = new PreparedQuery<
    ICreateComponentQueryParams,
    ICreateComponentQueryResult
>(createComponentQueryIR)

/** 'UpdateComponentQuery' parameters type */
export interface IUpdateComponentQueryParams {
    assetId?: number | null | void
    componentId: number
    content?: Json | null | void
    pageId: number
}

/** 'UpdateComponentQuery' return type */
export type IUpdateComponentQueryResult = void

/** 'UpdateComponentQuery' query type */
export interface IUpdateComponentQueryQuery {
    params: IUpdateComponentQueryParams
    result: IUpdateComponentQueryResult
}

const updateComponentQueryIR: any = {
    usedParamSet: {
        content: true,
        assetId: true,
        componentId: true,
        pageId: true
    },
    params: [
        {
            name: 'content',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 51, b: 58 }]
        },
        {
            name: 'assetId',
            required: false,
            transform: { type: 'scalar' },
            locs: [{ a: 91, b: 98 }]
        },
        {
            name: 'componentId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 122, b: 134 }]
        },
        {
            name: 'pageId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 150, b: 157 }]
        }
    ],
    statement:
        'UPDATE components.component SET content = COALESCE(:content, content), asset_id = COALESCE(:assetId, asset_id) WHERE id = :componentId! AND page_id = :pageId!'
}

/**
 * Query generated from SQL:
 * ```
 * UPDATE components.component SET content = COALESCE(:content, content), asset_id = COALESCE(:assetId, asset_id) WHERE id = :componentId! AND page_id = :pageId!
 * ```
 */
export const updateComponentQuery = new PreparedQuery<
    IUpdateComponentQueryParams,
    IUpdateComponentQueryResult
>(updateComponentQueryIR)

/** 'DeleteComponentQuery' parameters type */
export interface IDeleteComponentQueryParams {
    componentId: number
    pageId: number
}

/** 'DeleteComponentQuery' return type */
export type IDeleteComponentQueryResult = void

/** 'DeleteComponentQuery' query type */
export interface IDeleteComponentQueryQuery {
    params: IDeleteComponentQueryParams
    result: IDeleteComponentQueryResult
}

const deleteComponentQueryIR: any = {
    usedParamSet: { componentId: true, pageId: true },
    params: [
        {
            name: 'componentId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 44, b: 56 }]
        },
        {
            name: 'pageId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 72, b: 79 }]
        }
    ],
    statement:
        'DELETE FROM components.component WHERE id = :componentId! AND page_id = :pageId!'
}

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM components.component WHERE id = :componentId! AND page_id = :pageId!
 * ```
 */
export const deleteComponentQuery = new PreparedQuery<
    IDeleteComponentQueryParams,
    IDeleteComponentQueryResult
>(deleteComponentQueryIR)

/** 'FindComponentByIdQuery' parameters type */
export interface IFindComponentByIdQueryParams {
    componentId: number
    pageId: number
}

/** 'FindComponentByIdQuery' return type */
export interface IFindComponentByIdQueryResult {
    asset_id: number | null
    content: Json | null
    created_at: Date
    custom_style: string | null
    id: number
    page_id: number
    type: component_type
    updated_at: Date | null
}

/** 'FindComponentByIdQuery' query type */
export interface IFindComponentByIdQueryQuery {
    params: IFindComponentByIdQueryParams
    result: IFindComponentByIdQueryResult
}

const findComponentByIdQueryIR: any = {
    usedParamSet: { componentId: true, pageId: true },
    params: [
        {
            name: 'componentId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 46, b: 58 }]
        },
        {
            name: 'pageId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 74, b: 81 }]
        }
    ],
    statement:
        'SELECT * FROM components.component WHERE id = :componentId! AND page_id = :pageId!'
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM components.component WHERE id = :componentId! AND page_id = :pageId!
 * ```
 */
export const findComponentByIdQuery = new PreparedQuery<
    IFindComponentByIdQueryParams,
    IFindComponentByIdQueryResult
>(findComponentByIdQueryIR)

/** 'FindAllComponentsQuery' parameters type */
export interface IFindAllComponentsQueryParams {
    pageId: number
}

/** 'FindAllComponentsQuery' return type */
export interface IFindAllComponentsQueryResult {
    asset_id: number | null
    content: Json | null
    created_at: Date
    custom_style: string | null
    id: number
    page_id: number
    type: component_type
    updated_at: Date | null
}

/** 'FindAllComponentsQuery' query type */
export interface IFindAllComponentsQueryQuery {
    params: IFindAllComponentsQueryParams
    result: IFindAllComponentsQueryResult
}

const findAllComponentsQueryIR: any = {
    usedParamSet: { pageId: true },
    params: [
        {
            name: 'pageId',
            required: true,
            transform: { type: 'scalar' },
            locs: [{ a: 51, b: 58 }]
        }
    ],
    statement: 'SELECT * FROM components.component WHERE page_id = :pageId!'
}

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM components.component WHERE page_id = :pageId!
 * ```
 */
export const findAllComponentsQuery = new PreparedQuery<
    IFindAllComponentsQueryParams,
    IFindAllComponentsQueryResult
>(findAllComponentsQueryIR)
