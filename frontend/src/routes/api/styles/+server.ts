import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
	const cssPath = resolve("src/app.css");
	const cssContent = await readFile(cssPath, "utf8");

	return new Response(cssContent, { headers: { "Content-Type": "text/css" } });
};
