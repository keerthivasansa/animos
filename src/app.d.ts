declare global {
	namespace App {
		interface Locals {
			auth: import("lucia-auth").AuthRequest;
		}
	}
}

/// <reference types="lucia-auth" />
declare global {
	namespace Lucia {
		type Auth = import("@server/auth/lucia").Auth;
		type UserAttributes = Record<string, never>; // no custom attributes
	}
}

export { };