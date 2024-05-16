import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch, params }) => {
	const websiteData = await fetch(
		`http://localhost:3000/api/v1/websites/${params.websiteId}`,
	);

	if (!websiteData.ok) {
		throw error(404, "Website not found");
	}

	const website = await websiteData.json();

	return {
		website,
	};
};
