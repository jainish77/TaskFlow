import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAuth } from "./AuthContext";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Create a strongly typed interface from the validation schema.
type LoginFormData = z.infer<typeof schema>;

/**
 * Small form that demonstrates:
 *  - react-hook-form for state/validation
 *  - error handling and optimistic UI
 */
export const LoginForm = () => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema)
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    // Convert react-hook-form submission into an async login call.
    try {
      setServerError(null);
      setLoading(true);
      await login(values.email, values.password);
    } catch (error) {
      setServerError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  });

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label>
        Email
        {/* Spread register props so react-hook-form can manage this input. */}
        <input type="email" {...register("email")} placeholder="you@example.com" />
        {errors.email?.message && (
          <span style={{ color: "crimson" }}>{String(errors.email.message)}</span>
        )}
      </label>
      <label>
        Password
        <input type="password" {...register("password")} placeholder="••••••••" />
        {errors.password?.message && (
          <span style={{ color: "crimson" }}>{String(errors.password.message)}</span>
        )}
      </label>
      {serverError && <span style={{ color: "crimson" }}>{serverError}</span>}
      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};

