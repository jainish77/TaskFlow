import axios, { AxiosRequestHeaders } from "axios";

/**
 * Axios instance that automatically attaches the access token if available.
 * We inject the token via a small setter exported at the bottom.
 */
export const api = axios.create({
  baseURL: "/api"
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders;
    headers.Authorization = `Bearer ${accessToken}`;
    config.headers = headers;
  }
  return config;
});

