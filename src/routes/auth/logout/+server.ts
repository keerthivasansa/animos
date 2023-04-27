import { auth } from '@server/auth/lucia.js';

const redirectToHome = new Response(null, {
	status: 307,
	headers: {
		location: '/'
	}
});

export const GET = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) return redirectToHome;
	await auth.invalidateSession(session.sessionId);
	locals.auth.setSession(null);
	return redirectToHome;
};
