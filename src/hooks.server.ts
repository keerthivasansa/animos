import { auth, environment } from "@server/auth/lucia";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.auth = auth.handleRequest(event, environment);
	return await resolve(event);
};