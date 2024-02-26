-- migrate:up
CREATE TABLE oauth_account (
    provider_id VARCHAR NOT NULL,
    provider_user_id VARCHAR NOT NULL,
    user_id VARCHAR NOT NULL REFERENCES auth_user(id),
    PRIMARY KEY (provider_id, provider_user_id)
);

-- migrate:down
DROP TABLE oauth_account;