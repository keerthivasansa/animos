import { PROXY_AUTH, PROXY_IP, PROXY_PORT } from "$env/static/private";
import axios from "axios";
import HttpsProxyAgent from "https-proxy-agent/dist/agent";

export const USER_AGENT = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36`;

// for use with cloudflare
export const proxyAxios = axios.create({
    httpsAgent: new HttpsProxyAgent({
        rejectUnauthorized: true,
        host: PROXY_IP,
        port: PROXY_PORT,
        auth: PROXY_AUTH,
    }),
    headers: {
        "User-Agent": USER_AGENT
    },
    xsrfCookieName: "XSRF-TOKEN", 
})