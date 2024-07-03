import type { Component } from "common";
import { writable } from "svelte/store";

export const components = writable<Component[]>([]);
export const selectedComponent = writable<string | null>(null);
export const draggedComponentId = writable<string | null>(null);
