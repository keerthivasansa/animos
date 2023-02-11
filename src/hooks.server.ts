import type { Handle } from "@sveltejs/kit";
import { router } from "$lib/trpc/index";
import { createContext } from "$lib/trpc/server";
import { createTRPCHandle } from "trpc-sveltekit";

export const handle: Handle = createTRPCHandle({ router, createContext });
