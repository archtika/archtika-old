import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({
  fetch,
  params,
  parent,
  locals,
}) => {
  const deploymentsData = await fetch(
    `http://localhost:3000/api/v1/websites/${params.websiteId}/deployments`,
  );

  const deployments = await deploymentsData.json();
  const { website } = await parent();

  return {
    account: locals.account,
    deployments,
    website,
  };
};
