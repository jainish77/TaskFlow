import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import { LoginForm } from "./features/auth/LoginForm";
import { RegisterForm } from "./features/auth/RegisterForm";
import { AuthGuard } from "./features/auth/AuthGuard";
import { ProjectsPage } from "./features/projects/ProjectsPage";
import { ProjectDetailPage } from "./features/projects/ProjectDetailPage";
/**
 * Layout shell rendered around the authenticated area.
 * Contains a header with user info and logout button.
 */
const AppShell = ({ children }) => {
    const { user, logout } = useAuth();
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("header", { style: { display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }, children: [_jsx(Link, { to: "/", style: { fontWeight: 700, fontSize: "1.35rem", textDecoration: "none" }, children: "TaskFlow" }), user && (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.75rem" }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600 }, children: user.fullName }), _jsx("small", { style: { color: "#4b5563" }, children: user.email })] }), _jsx("button", { className: "btn btn-secondary", onClick: logout, children: "Log out" })] }))] }), children] }));
};
/**
 * Landing page shown when the user hits /login while already authenticated.
 */
const LoginPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    if (user) {
        const destination = location.state?.from?.pathname ?? "/";
        return _jsx(Navigate, { to: destination, replace: true });
    }
    return (_jsx("div", { className: "app-shell", children: _jsxs("div", { className: "card", children: [_jsx("h2", { children: "Sign in" }), _jsx("p", { style: { marginTop: 0, color: "#4b5563" }, children: "Use the seeded credentials admin@taskflow.dev / changeme to explore quickly." }), _jsx(LoginForm, {}), _jsxs("p", { children: ["No account yet? ", _jsx(Link, { to: "/register", children: "Create one" })] })] }) }));
};
const RegisterPage = () => {
    const { user } = useAuth();
    if (user) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return (_jsx("div", { className: "app-shell", children: _jsxs("div", { className: "card", children: [_jsx("h2", { children: "Create your TaskFlow account" }), _jsx(RegisterForm, {}), _jsxs("p", { children: ["Already have an account? ", _jsx(Link, { to: "/login", children: "Sign in" })] })] }) }));
};
/**
 * Root component wires the auth provider and the routes together.
 */
const App = () => {
    return (_jsx(AuthProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/", element: _jsx(AuthGuard, { children: _jsx(AppShell, { children: _jsx(ProjectsPage, {}) }) }) }), _jsx(Route, { path: "/projects/:projectId", element: _jsx(AuthGuard, { children: _jsx(AppShell, { children: _jsx(ProjectDetailPage, {}) }) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/" }) })] }) }));
};
export default App;
