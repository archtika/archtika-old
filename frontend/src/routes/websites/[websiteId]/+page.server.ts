import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
	const collaboratorsData = await fetch(
		`http://localhost:3000/api/v1/websites/${params.websiteId}/collaborators`,
	);
	const pagesData = await fetch(
		`http://localhost:3000/api/v1/websites/${params.websiteId}/pages`,
	);

	const { website } = await parent();
	const collaborators = await collaboratorsData.json();
	const pages = await pagesData.json();

	return {
		website,
		collaborators,
		pages,
	};
};

export const actions: Actions = {
	updateWebsite: async ({ request, fetch, params }) => {
		const data = await request.formData();

		await fetch(`http://localhost:3000/api/v1/websites/${params.websiteId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				title: data.get("title"),
				metaDescription: data.get("description"),
			}),
		});
	},
	deleteWebsite: async ({ fetch, params }) => {
		const deletionRequest = await fetch(
			`http://localhost:3000/api/v1/websites/${params.websiteId}`,
			{
				method: "DELETE",
			},
		);

		if (!deletionRequest.ok) {
			throw error(403, "Not allowed");
		}

		throw redirect(303, "/");
	},
	addCollaborator: async ({ request, fetch, params }) => {
		const data = await request.formData();

		await fetch(
			`http://localhost:3000/api/v1/websites/${
				params.websiteId
			}/collaborators/${data.get("user-id")}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					permissionLevel: data.get("permission-level"),
				}),
			},
		);
	},
	updateCollaborator: async ({ request, fetch, params }) => {
		const data = await request.formData();

		await fetch(
			`http://localhost:3000/api/v1/websites/${
				params.websiteId
			}/collaborators/${data.get("user-id")}`,
			{
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					permissionLevel: data.get("permission-level"),
				}),
			},
		);
	},
	removeCollaborator: async ({ request, fetch, params }) => {
		const data = await request.formData();

		await fetch(
			`http://localhost:3000/api/v1/websites/${
				params.websiteId
			}/collaborators/${data.get("user-id")}`,
			{
				method: "DELETE",
			},
		);
	},
	createPage: async ({ request, fetch, params }) => {
		const data = await request.formData();

		await fetch(
			`http://localhost:3000/api/v1/websites/${params.websiteId}/pages`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					route: data.get("route"),
					title: data.get("title"),
					metaDescription: data.get("description"),
				}),
			},
		);
	},
};
