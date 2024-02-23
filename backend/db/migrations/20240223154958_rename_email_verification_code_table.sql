-- migrate:up
ALTER TABLE email_verification_codes RENAME TO email_verification_code;

-- migrate:down
ALTER TABLE email_verification_code RENAME TO email_verification_codes;