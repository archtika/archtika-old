-- migrate:up
ALTER TABLE auth_user ALTER COLUMN password DROP NOT NULL;

-- migrate:down
ALTER TABLE auth_user ALTER COLUMN password SET NOT NULL;