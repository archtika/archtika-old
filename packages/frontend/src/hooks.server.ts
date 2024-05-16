import { type Handle, redirect } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const accountData = await event.fetch("http://localhost:3000/api/v1/account");

	if (!accountData.ok && event.url.pathname !== "/login") {
		throw redirect(302, "/login");
	}

	if (accountData.ok) {
		if (event.url.pathname === "/login") {
			throw redirect(302, "/account");
		}

		const account = await accountData.json();

		event.locals.account = account;
	}

	return await resolve(event);
};
