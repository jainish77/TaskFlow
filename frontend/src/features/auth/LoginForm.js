import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAuth } from "./AuthContext";
const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});
/**
 * Small form that demonstrates:
 *  - react-hook-form for state/validation
 *  - error handling and optimistic UI
 */
export const LoginForm = () => {
    const { login } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });
    const [serverError, setServerError] = useState(null);
    const [loading, setLoading] = useState(false);
    const onSubmit = handleSubmit(async (values) => {
        // Convert react-hook-form submission into an async login call.
        try {
            setServerError(null);
            setLoading(true);
            await login(values.email, values.password);
        }
        catch (error) {
            setServerError("Invalid credentials");
        }
        finally {
            setLoading(false);
        }
    });
    return (_jsxs("form", { className: "form-grid", onSubmit: onSubmit, children: [_jsxs("label", { children: ["Email", _jsx("input", { type: "email", ...register("email"), placeholder: "you@example.com" }), errors.email?.message && (_jsx("span", { style: { color: "crimson" }, children: String(errors.email.message) }))] }), _jsxs("label", { children: ["Password", _jsx("input", { type: "password", ...register("password"), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), errors.password?.message && (_jsx("span", { style: { color: "crimson" }, children: String(errors.password.message) }))] }), serverError && _jsx("span", { style: { color: "crimson" }, children: serverError }), _jsx("button", { className: "btn btn-primary", disabled: loading, children: loading ? "Signing in..." : "Sign In" })] }));
};
