import { writable } from "svelte/store";
import type { Component } from "common";

export const components = writable<Component[]>([]);
export const selectedComponent = writable<string | null | undefined>();
