-- migrate:up
ALTER TABLE oauth_account DROP CONSTRAINT oauth_account_user_id_fkey;
ALTER TABLE user_session DROP CONSTRAINT user_session_user_id_fkey;

ALTER TABLE oauth_account ADD CONSTRAINT oauth_account_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE;
ALTER TABLE user_session ADD CONSTRAINT user_session_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE;

-- migrate:down
