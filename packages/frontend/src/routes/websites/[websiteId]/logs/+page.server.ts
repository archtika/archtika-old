import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
  const logsData = await fetch(
    `http://localhost:3000/api/v1/websites/${params.websiteId}/change-log`,
  );

  const { website } = await parent();
  const logs = await logsData.json();

  return {
    logs,
    website,
  };
};
