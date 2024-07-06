import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const appCssPath = resolve("src/app.css");
  const outputCssPath = resolve("src/output.css");

  const appCssContent = await readFile(appCssPath, "utf8");
  const outputCssContent = await readFile(outputCssPath, "utf8");

  const combinedCssContent = `${appCssContent}\n${outputCssContent}`;

  return new Response(combinedCssContent, {
    headers: { "Content-Type": "text/css" },
  });
};
