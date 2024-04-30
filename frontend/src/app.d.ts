// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

interface Account {
	id: string;
	username: string;
	email: string;
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			account: Account;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export type {};
