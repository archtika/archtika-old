-- migrate:up
CREATE TABLE password_reset_token (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES auth_user(id),
  expires_at TIMESTAMPTZ NOT NULL
);

-- migrate:down
DROP TABLE password_reset_token;
