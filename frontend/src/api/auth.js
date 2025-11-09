import { api } from "./client";
// Exchange credentials for access and refresh tokens.
export const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
};
// Create a new user account and immediately sign them in.
export const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
};
// Ask the server for a fresh access token using the long-lived refresh token.
export const refresh = async (refreshToken) => {
    const { data } = await api.post("/auth/refresh", {}, {
        headers: { Authorization: `Bearer ${refreshToken}` }
    });
    return data;
};
