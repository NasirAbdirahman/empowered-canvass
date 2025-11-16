import { createCookieSessionStorage, redirect } from "react-router";

// Session secret - MUST be set in production
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET environment variable must be set in production");
  }
  console.warn("⚠️  SESSION_SECRET not set. Using default secret for development only.");
}

// Use a secure default for dev only
const secrets = [sessionSecret || "dev-secret-change-in-production-min-32-chars"];

// Create session storage with secure defaults
const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true, 
    maxAge: 60 * 60 * 24 * 7, 
    path: "/",
    sameSite: "lax",
    secrets,
    secure: process.env.NODE_ENV === "production",
  },
});

// Get user session from request
export async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

// Get userId from session
export async function getUserId(request: Request): Promise<string | null> {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  return userId || null;
}

// Create user session
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

// Logout and destroy session
export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export { getSession, commitSession, destroySession };
