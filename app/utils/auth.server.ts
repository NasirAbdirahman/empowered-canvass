import bcrypt from "bcryptjs";
import { redirect } from "react-router";
import { prisma } from "./db.server";
import { getUserId } from "./session.server";

// Login function
export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  return { id: user.id, email: user.email, name: user.name };
}

// Register function
export async function register({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return { id: user.id, email: user.email, name: user.name };
}

// Get user by ID
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

// Get current user from request
export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;

  try {
    const user = await getUserById(userId);
    return user;
  } catch {
    throw logout(request);
  }
}

// Require user to be logged in - redirect to login if not
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

// Get user or redirect if not authenticated
export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user) {
    throw logout(request);
  }

  return user;
}

function logout(request: Request) {
  return redirect("/login");
}


// Exportable password utilities for testing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}