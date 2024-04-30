export interface Component {
	id: string;
	type: string;
	page_id: string;
	content: {
		altText?: string;
		textContent?: string;
		isLooped?: boolean;
	};
	asset_id?: string;
	created_at: string;
	updated_at: string | null;
	url: sring | null;
	row_start: number;
	col_start: number;
	row_end: number;
	col_end: number;
	row_end_span: number;
	col_end_span: number;
}

export interface ComponentApiPayload {
	type: string;
	content: {
		altText?: string;
		textContent?: string;
		isLooped?: boolean;
	};
	assetId?: string;
}
