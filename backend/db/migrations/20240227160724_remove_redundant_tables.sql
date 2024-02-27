-- migrate:up
DROP TABLE password_reset_token, email_verification_code, two_factor_authorization_code;
ALTER TABLE auth_user DROP COLUMN password;
ALTER TABLE auth_user DROP COLUMN email_verified;

-- migrate:down
