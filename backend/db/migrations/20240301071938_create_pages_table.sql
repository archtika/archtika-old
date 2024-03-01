-- migrate:up
CREATE TABLE page (
  id SERIAL PRIMARY KEY,
  website_id INTEGER NOT NULL REFERENCES website(id) ON DELETE CASCADE,
  route VARCHAR NOT NULL UNIQUE,
  title VARCHAR,
  meta_description VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ
);

-- migrate:down
DROP TABLE page;