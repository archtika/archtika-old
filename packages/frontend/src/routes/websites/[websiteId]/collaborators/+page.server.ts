import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, params, parent }) => {
  const collaboratorData = await fetch(
    `http://localhost:3000/api/v1/websites/${params.websiteId}/collaborators`,
  );

  const { website } = await parent();
  const collaborators = await collaboratorData.json();

  return {
    collaborators,
    website,
  };
};

export const actions: Actions = {
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
};
