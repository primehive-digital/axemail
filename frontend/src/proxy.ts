import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAMES = {
  accessToken: "axemail_access_token",
  refreshToken: "axemail_refresh_token",
  user: "axemail_user",
  role: "axemail_role",
} as const;

type UserRole = "admin" | "manager" | "employee";

const publicRoutes = new Set(["/"]);

const roleRoutes: Record<UserRole, string[]> = {
  employee: [
    "/overview",
    "/outreach",
    "/operations",
    "/analytics/activity-insights",
    "/settings",
    "/notifications",
  ],
  manager: [
    "/overview",
    "/outreach-enablement",
    "/analytics/activity-insights",
    "/administration/user-management",
    "/administration/allocation-management",
    "/settings",
    "/notifications",
  ],
  admin: [
    "/overview",
    "/analytics",
    "/administration",
    "/settings",
    "/notifications",
  ],
};

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = getSessionFromRequest(request);
  const isPublicRoute = publicRoutes.has(pathname);

  if (isPublicRoute && session.isAuthenticated) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  if (!isPublicRoute && !session.isAuthenticated) {
    return redirectToLogin(request);
  }

  if (!isPublicRoute && session.role && !isRouteAllowed(pathname, session.role)) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicons|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

function getSessionFromRequest(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value;
  const cookieRole = request.cookies.get(AUTH_COOKIE_NAMES.role)?.value;
  const tokenPayload = accessToken ? decodeJwtPayload(accessToken) : null;
  const tokenRole = normalizeRole(tokenPayload?.role);
  const role = normalizeRole(cookieRole) ?? tokenRole;
  const expiresAt = typeof tokenPayload?.exp === "number" ? tokenPayload.exp * 1000 : null;
  const isExpired = expiresAt ? expiresAt <= Date.now() : true;

  return {
    isAuthenticated: Boolean(accessToken && role && !isExpired),
    role,
  };
}

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(decoded) as { exp?: number; role?: string };
  } catch {
    return null;
  }
}

function normalizeRole(role: unknown): UserRole | null {
  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.toLowerCase();

  if (normalized === "admin" || normalized === "manager" || normalized === "employee") {
    return normalized;
  }

  return null;
}

function isRouteAllowed(pathname: string, role: UserRole) {
  return roleRoutes[role].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));

  Object.values(AUTH_COOKIE_NAMES).forEach((name) => {
    response.cookies.delete(name);
  });

  return response;
}