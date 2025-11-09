import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAuth } from "./AuthContext";
const schema = z
    .object({
    email: z.string().email(),
    fullName: z.string().min(2),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
})
    .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"]
});
export const RegisterForm = () => {
    const { register: doRegister } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
    const [serverError, setServerError] = useState(null);
    const [loading, setLoading] = useState(false);
    const onSubmit = handleSubmit(async ({ email, fullName, password }) => {
        // Call backend registration, surface errors to the user when it fails.
        try {
            setServerError(null);
            setLoading(true);
            await doRegister(email, fullName, password);
        }
        catch (error) {
            setServerError("Account already exists");
        }
        finally {
            setLoading(false);
        }
    });
    return (_jsxs("form", { className: "form-grid", onSubmit: onSubmit, children: [_jsxs("label", { children: ["Email", _jsx("input", { type: "email", ...register("email"), placeholder: "you@example.com" }), errors.email && _jsx("span", { style: { color: "crimson" }, children: errors.email.message })] }), _jsxs("label", { children: ["Full name", _jsx("input", { type: "text", ...register("fullName"), placeholder: "Taylor Swift" }), errors.fullName && _jsx("span", { style: { color: "crimson" }, children: errors.fullName.message })] }), _jsxs("label", { children: ["Password", _jsx("input", { type: "password", ...register("password"), placeholder: "min 8 characters" }), errors.password && _jsx("span", { style: { color: "crimson" }, children: errors.password.message })] }), _jsxs("label", { children: ["Confirm password", _jsx("input", { type: "password", ...register("confirmPassword") }), errors.confirmPassword && _jsx("span", { style: { color: "crimson" }, children: errors.confirmPassword.message })] }), serverError && _jsx("span", { style: { color: "crimson" }, children: serverError }), _jsx("button", { className: "btn btn-primary", disabled: loading, children: loading ? "Creating..." : "Create Account" })] }));
};
