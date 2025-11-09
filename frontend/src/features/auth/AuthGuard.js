import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
/**
 * Simple component that redirects unauthenticated visitors to `/login`.
 */
export const AuthGuard = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location } });
    }
    return _jsx(_Fragment, { children: children });
};
