import { writable } from "svelte/store";
import type { Component } from "./types";

export const components = writable<Component[]>([]);
export const selectedComponent = writable<string | null>();
