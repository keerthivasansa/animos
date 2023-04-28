import axios, { type CreateAxiosDefaults } from "axios";

export const USER_AGENT = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36`;

// for use with cloudflare


function createAxios(config?: CreateAxiosDefaults) {
    return axios.create({ ...config, headers: { 'User-Agent': USER_AGENT } });
}

export { createAxios };