import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { website } = await parent();

  return {
    website,
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
  generateWebsite: async ({ fetch, params }) => {
    await fetch(
      `http://localhost:3000/api/v1/websites/${params.websiteId}/generate`,
    );
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
