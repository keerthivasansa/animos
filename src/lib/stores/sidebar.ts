import { writable } from 'svelte/store';

export const sidebarExpand = writable(false);
export const sidebarShowLabel = writable(false);

sidebarExpand.subscribe((val) => {
	if (!val) sidebarShowLabel.set(false);
});
