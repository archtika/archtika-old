import { redirect, type Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
    const accountData = await event.fetch(
        'http://localhost:3000/api/v1/account'
    )

    if (!accountData.ok && event.url.pathname !== '/login') {
        throw redirect(302, '/login')
    }

    const account = await accountData.json()

    event.locals.account = account

    const response = await resolve(event)
    return response
}
