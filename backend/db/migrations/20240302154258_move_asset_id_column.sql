-- migrate:up
ALTER TABLE components.component ADD COLUMN asset_id INTEGER REferences media.media_asset(id);

-- migrate:down

