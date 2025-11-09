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

// Infer TypeScript types directly from the Zod validation schema.
type RegisterFormData = z.infer<typeof schema>;

export const RegisterForm = () => {
  const { register: doRegister } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({ resolver: zodResolver(schema) });
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async ({ email, fullName, password }) => {
    // Call backend registration, surface errors to the user when it fails.
    try {
      setServerError(null);
      setLoading(true);
      await doRegister(email, fullName, password);
    } catch (error) {
      setServerError("Account already exists");
    } finally {
      setLoading(false);
    }
  });

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label>
        Email
        {/* register connects the input to react-hook-form and Zod validation. */}
        <input type="email" {...register("email")} placeholder="you@example.com" />
        {errors.email && <span style={{ color: "crimson" }}>{errors.email.message}</span>}
      </label>
      <label>
        Full name
        <input type="text" {...register("fullName")} placeholder="Taylor Swift" />
        {errors.fullName && <span style={{ color: "crimson" }}>{errors.fullName.message}</span>}
      </label>
      <label>
        Password
        <input type="password" {...register("password")} placeholder="min 8 characters" />
        {errors.password && <span style={{ color: "crimson" }}>{errors.password.message}</span>}
      </label>
      <label>
        Confirm password
        <input type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && <span style={{ color: "crimson" }}>{errors.confirmPassword.message}</span>}
      </label>
      {serverError && <span style={{ color: "crimson" }}>{serverError}</span>}
      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
};

