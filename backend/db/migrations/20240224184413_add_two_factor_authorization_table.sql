-- migrate:up
CREATE TABLE two_factor_authorization_code (
    id SERIAL PRIMARY KEY,
    code VARCHAR,
    user_id VARCHAR UNIQUE NOT NULL REFERENCES auth_user(id)
);

-- migrate:down
DROP TABLE two_factor_authorization_code;