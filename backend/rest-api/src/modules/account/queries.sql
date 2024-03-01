/* @name FindExistingUserQuery */
SELECT * FROM auth.auth_user WHERE email = :email!;

/* @name FindExistingOAuthAccountQuery */
SELECT * FROM auth.oauth_account WHERE provider_id = :providerId! AND provider_user_id = :providerUserId!;

/*
  @name CreateUserQuery
  @param user -> (id, username, email)
*/
INSERT INTO auth.auth_user (id, username, email) VALUES :user;

/*
  @name CreateOAuthAccountQuery
  @param oAuthAccount -> (providerId, providerUserId, userId)
*/
INSERT INTO auth.oauth_account (provider_id, provider_user_id, user_id) VALUES :oAuthAccount;