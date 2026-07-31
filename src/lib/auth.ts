import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bodana-digital-secret-change-in-production"
);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(userId: string, role: string) {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, credits: true, teamId: true },
    });
    return user;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
