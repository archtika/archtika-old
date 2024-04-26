export interface Component {
    id: string
    type: string
    page_id: string
    content: {
        altText?: string
        textContent?: string
        isLooped?: boolean
    }
    asset_id?: string
    created_at: string
    updated_at: string | null
    url: sring | null
    rowStart: number
    colStart: number
    rowEnd: number
    colEnd: number
    rowEndSpan: number
    colEndSpan: number
}

export interface ComponentApiPayload {
    type: string
    content: {
        altText?: string
        textContent?: string
        isLooped?: boolean
    }
    assetId?: string
}
