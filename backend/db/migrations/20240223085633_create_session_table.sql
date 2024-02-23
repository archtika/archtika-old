-- migrate:up
CREATE TABLE user_session (
  id VARCHAR NOT NULL PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  user_id VARCHAR NOT NULL REFERENCES auth_user(id)
);

-- migrate:down
DROP TABLE user_session;