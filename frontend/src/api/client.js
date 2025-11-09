import axios from "axios";
/**
 * Axios instance that automatically attaches the access token if available.
 * We inject the token via a small setter exported at the bottom.
 */
export const api = axios.create({
    baseURL: "/api"
});
let accessToken = null;
export const setAccessToken = (token) => {
    accessToken = token;
};
api.interceptors.request.use((config) => {
    if (accessToken) {
        const headers = (config.headers ?? {});
        headers.Authorization = `Bearer ${accessToken}`;
        config.headers = headers;
    }
    return config;
});
