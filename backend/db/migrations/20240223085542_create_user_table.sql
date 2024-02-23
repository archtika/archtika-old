-- migrate:up
CREATE TABLE auth_user (
  id VARCHAR NOT NULL PRIMARY KEY,
  username VARCHAR NOT NULL UNIQUE,
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL
);

-- migrate:down
DROP TABLE auth_user;