import { randomUUID } from "node:crypto";
import { generateCodeVerifier, generateState } from "arctic";
import type { FastifyReply, FastifyRequest } from "fastify";

interface GitHubEmailObject {
  email: string;
  verified: boolean;
  primary: boolean;
  visibility: string;
}

interface RequestQuery {
  code: string;
  state: string;
}

export async function loginWithGithub(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const state = generateState();
  const url = await req.server.lucia.oAuth.github.createAuthorizationURL(
    state,
    {
      scopes: ["user:email"],
    },
  );

  reply.setCookie("github_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return reply.redirect(url.toString());
}

export async function loginWithGithubCallback(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const code = (req.query as RequestQuery).code?.toString() ?? null;
  const state = (req.query as RequestQuery).state?.toString() ?? null;
  const storedState = req.cookies.github_oauth_state;

  if (!code || !state || state !== storedState) {
    return reply.unauthorized();
  }

  const tokens =
    await req.server.lucia.oAuth.github.validateAuthorizationCode(code);
  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });
  const githubUserEmailsResponse = await fetch(
    "https://api.github.com/user/emails",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    },
  );
  const githubUser = await githubUserResponse.json();
  const githubUserEmails = await githubUserEmailsResponse.json();

  const primaryEmail = githubUserEmails.find(
    (email: GitHubEmailObject) => email.primary,
  );

  if (!primaryEmail) {
    return reply.unauthorized("No primary email found");
  }

  if (!primaryEmail.verified) {
    return reply.unauthorized("Primary email not verified");
  }

  const existingUser = await req.server.kysely.db
    .selectFrom("auth.auth_user")
    .selectAll()
    .where("email", "=", primaryEmail.email)
    .executeTakeFirst();

  if (existingUser) {
    const existingOauthAccount = await req.server.kysely.db
      .selectFrom("auth.oauth_account")
      .selectAll()
      .where(({ and }) =>
        and({ provider_id: "github", provider_user_id: githubUser.id }),
      )
      .executeTakeFirst();

    if (!existingOauthAccount) {
      await req.server.kysely.db
        .insertInto("auth.oauth_account")
        .values({
          provider_id: "github",
          provider_user_id: githubUser.id,
          user_id: existingUser.id,
        })
        .execute();
    }

    const session = await req.server.lucia.luciaInstance.createSession(
      existingUser.id,
      {},
    );
    const cookie = req.server.lucia.luciaInstance.createSessionCookie(
      session.id,
    );

    reply.setCookie(cookie.name, cookie.value, cookie.attributes);

    return reply.redirect("http://localhost:5173");
  }

  const userId = randomUUID();

  await req.server.kysely.db
    .insertInto("auth.auth_user")
    .values({
      id: userId,
      username: githubUser.login,
      email: primaryEmail.email,
    })
    .execute();

  await req.server.kysely.db
    .insertInto("auth.oauth_account")
    .values({
      provider_id: "github",
      provider_user_id: githubUser.id,
      user_id: userId,
    })
    .execute();

  const session = await req.server.lucia.luciaInstance.createSession(
    userId,
    {},
  );
  const cookie = req.server.lucia.luciaInstance.createSessionCookie(session.id);

  reply.setCookie(cookie.name, cookie.value, cookie.attributes);

  return reply.redirect("http://localhost:5173");
}

export async function loginWithGoogle(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await req.server.lucia.oAuth.google.createAuthorizationURL(
    state,
    codeVerifier,
    {
      scopes: ["profile", "email"],
    },
  );
  url.searchParams.set("access_type", "offline");

  reply.setCookie("google_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  reply.setCookie("google_oauth_code_verifier", codeVerifier, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return reply.redirect(url.toString());
}

export async function loginWithGoogleCallback(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const code = (req.query as RequestQuery).code?.toString() ?? null;
  const state = (req.query as RequestQuery).state?.toString() ?? null;
  const storedState = req.cookies.google_oauth_state;
  const codeVerifier = req.cookies.google_oauth_code_verifier;

  if (!code || !state || state !== storedState || !codeVerifier) {
    return reply.unauthorized();
  }

  const tokens = await req.server.lucia.oAuth.google.validateAuthorizationCode(
    code,
    codeVerifier,
  );

  const googleUserResponse = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    },
  );
  const googleUser = await googleUserResponse.json();

  if (!googleUser.email_verified) {
    return reply.unauthorized("Email not verified");
  }

  const existingUser = await req.server.kysely.db
    .selectFrom("auth.auth_user")
    .selectAll()
    .where("email", "=", googleUser.email)
    .executeTakeFirst();

  if (existingUser) {
    const existingOauthAccount = await req.server.kysely.db
      .selectFrom("auth.oauth_account")
      .selectAll()
      .where(({ and }) =>
        and({ provider_id: "google", provider_user_id: googleUser.sub }),
      )
      .executeTakeFirst();

    if (!existingOauthAccount) {
      await req.server.kysely.db
        .insertInto("auth.oauth_account")
        .values({
          provider_id: "google",
          provider_user_id: googleUser.sub,
          user_id: existingUser.id,
        })
        .execute();
    }

    const session = await req.server.lucia.luciaInstance.createSession(
      existingUser.id,
      {},
    );
    const cookie = req.server.lucia.luciaInstance.createSessionCookie(
      session.id,
    );

    reply.setCookie(cookie.name, cookie.value, cookie.attributes);

    return reply.redirect("http://localhost:5173");
  }

  const userId = randomUUID();

  await req.server.kysely.db
    .insertInto("auth.auth_user")
    .values({
      id: userId,
      username: googleUser.name,
      email: googleUser.email,
    })
    .execute();

  await req.server.kysely.db
    .insertInto("auth.oauth_account")
    .values({
      provider_id: "google",
      provider_user_id: googleUser.sub,
      user_id: userId,
    })
    .execute();

  const session = await req.server.lucia.luciaInstance.createSession(
    userId,
    {},
  );
  const cookie = req.server.lucia.luciaInstance.createSessionCookie(session.id);

  reply.setCookie(cookie.name, cookie.value, cookie.attributes);

  return reply.redirect("http://localhost:5173");
}

export async function getAccount(req: FastifyRequest, reply: FastifyReply) {
  const user = await req.server.kysely.db
    .selectFrom("auth.auth_user")
    .selectAll()
    .where("id", "=", req.user?.id ?? "")
    .executeTakeFirstOrThrow();

  return reply.status(200).send(user);
}

export async function logout(req: FastifyRequest, reply: FastifyReply) {
  await req.server.lucia.luciaInstance.invalidateSession(req.session?.id ?? "");

  reply.clearCookie(req.server.lucia.luciaInstance.sessionCookieName);
  reply.clearCookie("github_oauth_state");
  reply.clearCookie("google_oauth_state");
  reply.clearCookie("google_oauth_code_verifier");

  return reply.redirect("http://localhost:5173/login");
}

export async function deleteAccount(req: FastifyRequest, reply: FastifyReply) {
  await req.server.kysely.db
    .deleteFrom("auth.auth_user")
    .where("id", "=", req.user?.id ?? "")
    .execute();

  return reply.status(204).send();
}
