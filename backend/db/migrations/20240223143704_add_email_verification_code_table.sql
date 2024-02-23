-- migrate:up
CREATE TABLE email_verification_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR NOT NULL,
    user_id VARCHAR UNIQUE NOT NULL REFERENCES auth_user(id),
    email VARCHAR NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- migrate:down
DROP TABLE email_verification_codes;