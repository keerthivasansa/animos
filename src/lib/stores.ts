import { writable, type Writable } from "svelte/store";
import type { User } from "@prisma/client";
import { page } from "$app/stores";
import { trpc } from "./trpc";

export const accentClr = writable("");

export const coverAnimeFocus = writable(-1);

export const lockBody = writable(false);

export function createModal() {
  const store = writable(false);
  return {
    set: (val: boolean) => {
      if (val) {
        lockBody.set(true);
      } else {
        lockBody.set(false);
      }
      store.set(val);
    },
    subscribe: store.subscribe,
    update: store.update,
  };
}

export function trpcClient() {
  const client = writable(trpc());
  page.subscribe((pg) => {
    client.set(trpc(pg));
  });
  return {
    subscribe: client.subscribe,
  };
}

export const showSettings = createModal();
