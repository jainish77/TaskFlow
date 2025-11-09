import { ReactNode } from "react";
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
const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: "1.35rem", textDecoration: "none" }}>
          TaskFlow
        </Link>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{user.fullName}</div>
              <small style={{ color: "#4b5563" }}>{user.email}</small>
            </div>
            <button className="btn btn-secondary" onClick={logout}>
              Log out
            </button>
          </div>
        )}
      </header>
      {children}
    </div>
  );
};

/**
 * Landing page shown when the user hits /login while already authenticated.
 */
const LoginPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (user) {
    const destination = location.state?.from?.pathname ?? "/";
    return <Navigate to={destination} replace />;
  }
  return (
    <div className="app-shell">
      <div className="card">
        <h2>Sign in</h2>
        <p style={{ marginTop: 0, color: "#4b5563" }}>
          Use the seeded credentials admin@taskflow.dev / changeme to explore quickly.
        </p>
        <LoginForm />
        <p>
          No account yet? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="app-shell">
      <div className="card">
        <h2>Create your TaskFlow account</h2>
        <RegisterForm />
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

/**
 * Root component wires the auth provider and the routes together.
 */
const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <AppShell>
                <ProjectsPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <AuthGuard>
              <AppShell>
                <ProjectDetailPage />
              </AppShell>
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;

