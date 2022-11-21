import { writable } from "svelte/store"

export const showSettings = writable(false);

export const accentClr = writable("");

export const coverAnimeFocus = writable(-1);