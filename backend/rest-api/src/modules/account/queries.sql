/* @name FindExistingUser */
SELECT * FROM auth_user WHERE email = :email;

/* @name FindExistingOAuthAccount */
SELECT * FROM oauth_account WHERE provider_id = :providerId AND provider_user_id = :providerUserId;

/* @name CreateUser */
INSERT INTO auth_user (id, username, email) VALUES (:id, :username, :email);

/* @name CreateOAuthAccount */
INSERT INTO oauth_account (provider_id, provider_user_id, user_id) VALUES (:providerId, :providerUserId, :userId);