export interface Media {
    id: string
    user_id: string
    name: string
    mimetype: string
    file_hash: string
    created_at: string
    url: string
}

export interface FilteredMedia {
    [key: string]: Media[]
}

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
}

export interface ComponentWithMedia extends Component {
    media: Media
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
