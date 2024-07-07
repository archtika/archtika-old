import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
  const pagesData = await fetch(
    `http://localhost:3000/api/v1/websites/${params.websiteId}/pages`,
  );

  const pages = await pagesData.json();
  const { website } = await parent();

  return {
    website,
    pages,
  };
};
