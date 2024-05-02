import { writable } from "svelte/store";
import type { Component } from "./types";

export const components = writable<Component[]>([]);
export const selectedComponent = writable<string | null | undefined>();
export const initialPosition = writable({
	rowStart: 1,
	colStart: 1,
	rowEnd: 1,
	colEnd: 1,
});
