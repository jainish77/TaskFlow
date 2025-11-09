import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as loginRequest, register as registerRequest } from "../../api/auth";
import { setAccessToken } from "../../api/client";
const AuthContext = createContext(undefined);
const ACCESS_TOKEN_KEY = "taskflow.accessToken";
const REFRESH_TOKEN_KEY = "taskflow.refreshToken";
const USER_KEY = "taskflow.user";
// Store tokens and user snapshot so sessions survive reloads.
const persistAuth = (payload) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
};
// Remove every persisted auth artifact.
const clearAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};
// Retrieve cached auth state when the app boots up.
const loadPersistedAuth = () => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    return {
        user: storedUser ? JSON.parse(storedUser) : null,
        accessToken: storedAccess,
        refreshToken: storedRefresh
    };
};
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => loadPersistedAuth().user);
    const [accessToken, setAccess] = useState(() => loadPersistedAuth().accessToken);
    const [refreshToken, setRefresh] = useState(() => loadPersistedAuth().refreshToken);
    useEffect(() => {
        // Keep Axios in sync with the active token so all requests pick it up automatically.
        setAccessToken(accessToken);
    }, [accessToken]);
    const applyAuthResponse = useCallback((payload) => {
        // Update React state and save to localStorage in one place.
        setUser(payload.user);
        setAccess(payload.accessToken);
        setRefresh(payload.refreshToken);
        persistAuth(payload);
    }, []);
    const login = useCallback(async (email, password) => {
        const payload = await loginRequest({ email, password });
        applyAuthResponse(payload);
    }, [applyAuthResponse]);
    const register = useCallback(async (email, fullName, password) => {
        const payload = await registerRequest({ email, fullName, password });
        applyAuthResponse(payload);
    }, [applyAuthResponse]);
    const logout = useCallback(() => {
        // Clear both React state and long-term storage.
        setUser(null);
        setAccess(null);
        setRefresh(null);
        setAccessToken(null);
        clearAuth();
    }, []);
    const value = useMemo(() => ({
        user,
        accessToken,
        refreshToken,
        login,
        register,
        logout
    }), [accessToken, login, logout, refreshToken, register, user]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
};
