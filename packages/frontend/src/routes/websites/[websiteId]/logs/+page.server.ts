import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
  const logsData = await fetch(
    `http://localhost:3000/api/v1/websites/${params.websiteId}/change-log`,
  );

  const logs = await logsData.json();
  const { website } = await parent();

  return {
    logs,
    website,
  };
};
