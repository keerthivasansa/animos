import { type Handle } from "@sveltejs/kit";

export const handle = (async ({ event, resolve }) => {
  if (!event.url.pathname.startsWith('/under-construction')) {
    return new Response("", { status: 307, headers: { location: "/under-construction" } });
  }
  const response = await resolve(event);
  return response;
}) satisfies Handle;