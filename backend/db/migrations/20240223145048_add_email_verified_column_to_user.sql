-- migrate:up
ALTER TABLE auth_user ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- migrate:down
ALTER TABLE auth_user DROP COLUMN email_verified;