export interface ComponentApiPayload {
  type: string;
  content?: {
    altText?: string;
    textContent?: string;
    isLooped?: boolean;
    hyperlink?: string;
  } | null;
  assetId?: string | null;
  parent_id?: string | null;
  is_public?: boolean;
}
