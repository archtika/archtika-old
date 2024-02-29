-- migrate:up
CREATE TABLE website (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  meta_description VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ
);

-- migrate:down
DROP TABLE website;