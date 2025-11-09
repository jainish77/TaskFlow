import { api } from "./client";

export type User = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  fullName: string;
  password: string;
};

// Exchange credentials for access and refresh tokens.
export const login = async (payload: LoginPayload) => {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
};

// Create a new user account and immediately sign them in.
export const register = async (payload: RegisterPayload) => {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
};

// Ask the server for a fresh access token using the long-lived refresh token.
export const refresh = async (refreshToken: string) => {
  const { data } = await api.post<AuthResponse>(
    "/auth/refresh",
    {},
    {
      headers: { Authorization: `Bearer ${refreshToken}` }
    }
  );
  return data;
};

