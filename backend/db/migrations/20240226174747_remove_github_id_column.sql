-- migrate:up
ALTER TABLE auth_user DROP COLUMN github_id;

-- migrate:down
ALTER TABLE auth_user ADD COLUMN github_id INTEGER;
