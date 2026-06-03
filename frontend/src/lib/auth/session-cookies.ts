import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import type { AuthSession, AuthUser } from "@/lib/auth/types";

export const AUTH_COOKIE_NAMES = {
  accessToken: "axemail_access_token",
  refreshToken: "axemail_refresh_token",
  user: "axemail_user",
  role: "axemail_role",
} as const;

const sessionMaxAgeSeconds = 8 * 60 * 60;

const secureCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: sessionMaxAgeSeconds,
} satisfies Partial<ResponseCookie>;

export async function setAuthCookies(session: AuthSession) {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAMES.accessToken, session.accessToken, secureCookieOptions);
  cookieStore.set(AUTH_COOKIE_NAMES.refreshToken, session.refreshToken, secureCookieOptions);
  cookieStore.set(AUTH_COOKIE_NAMES.role, session.user.role, secureCookieOptions);
  cookieStore.set(AUTH_COOKIE_NAMES.user, encodeAuthUser(session.user), secureCookieOptions);
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  Object.values(AUTH_COOKIE_NAMES).forEach((name) => {
    cookieStore.delete(name);
  });
}

export async function getAuthUserFromCookies() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(AUTH_COOKIE_NAMES.user)?.value;

  if (!userCookie) {
    return null;
  }

  return decodeAuthUser(userCookie);
}

export async function getAccessTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value ?? null;
}

export async function getRefreshTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value ?? null;
}

function encodeAuthUser(user: AuthUser) {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

function decodeAuthUser(value: string) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AuthUser;
  } catch {
    return null;
  }
}