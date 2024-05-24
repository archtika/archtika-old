import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
	const deploymentsData = await fetch(
		`http://localhost:3000/api/v1/websites/${params.websiteId}/deployments`,
	);

	const { website } = await parent();
	const deployments = await deploymentsData.json();

	return {
		deployments,
		website,
	};
};
