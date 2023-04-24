import { google } from "@lucia-auth/oauth/providers";
import { auth } from "./lucia";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";
import { dev } from "$app/environment";

const origin = dev ? "http://localhost:5173" : "https://animos.cf";
const redirectUri = `${origin}/api/oauth/google`;

console.log({ redirectUri });

const googleAuth = google(auth, {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri
});

export default googleAuth;