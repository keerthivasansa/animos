


import { redirect } from "@sveltejs/kit";
import { auth } from "@server/auth/lucia";
import googleAuth from "@server/auth/google";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies, url, locals }) => {
    // get code and state params from url
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    // get stored state from cookies
    const storedState = cookies.get("google_oauth_state");

    // validate state
    if (state !== storedState || !code) throw new Response(null, { status: 401 });

    try {
        const { existingUser, createUser } =
            await googleAuth.validateCallback(code);

        const getUser = async () => {
            if (existingUser) return existingUser;
            // create a new user if the user does not exist
            return await createUser({});
        };
        const user = await getUser();
        const session = await auth.createSession(user.userId);
        locals.auth.setSession(session);
    } catch (e) {
        // invalid code
        console.log(e);
        return new Response(null, {
            status: 500
        });
    }
    throw redirect(302, "/");
};