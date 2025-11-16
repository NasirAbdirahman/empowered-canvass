import { Form, Link, useActionData, redirect } from "react-router";
import { Input, Button, Alert } from "~/components/ui";
import { login } from "~/utils/auth.server";
import { createUserSession, getUserId } from "~/utils/session.server";
import { validateEmail, validatePassword } from "~/utils/validation";
import { useToggle, useFormSubmitting } from "~/hooks";

type ActionData = {
  errors?: {
    email?: string;
    password?: string;
    form?: string;
  };
};

export async function action({ request }: { request: Request }): Promise<Response | ActionData> {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  // Validate inputs
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (errors.email || errors.password) {
    return { errors };
  }

  // Attempt login
  const user = await login({ email, password });

  if (!user) {
    return {
      errors: {
        form: "Invalid email or password. Please try again.",
      },
    };
  }

  // Create session and redirect
  return createUserSession(user.id, redirectTo);
}

export async function loader({ request }: { request: Request }) {
  // Check if user is already logged in, redirect to dashboard
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/dashboard");
  }
  return null;
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const passwordVisibility = useToggle();
  const isSubmitting = useFormSubmitting();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Empowered Canvass</h1>

        {/* Welcome Message */}
        <h2 className="text-xl font-bold text-center text-gray-900 mb-8">
          Welcome back
        </h2>

        {/* Form Error Alert */}
        {actionData?.errors?.form && (
          <Alert variant="error" className="mb-6">
            {actionData.errors.form}
          </Alert>
        )}

        {/* Login Form */}
        <Form method="post" className="space-y-4">
          <Input
            name="email"
            type="email"
            label="Email address"
            placeholder="Enter your email"
            required
            error={actionData?.errors?.email}
            disabled={isSubmitting}
            autoComplete="email"
          />

          <div className="relative">
            <Input
              name="password"
              type={passwordVisibility.isOpen ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              required
              error={actionData?.errors?.password}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={passwordVisibility.toggle}
              className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
              aria-label={passwordVisibility.isOpen ? "Hide password" : "Show password"}
            >
              {passwordVisibility.isOpen ? (
                <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
          >
            Continue
          </Button>
        </Form>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
