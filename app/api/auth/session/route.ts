import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  // Try to validate the token with the Laravel API
  try {
    const apiRes = await fetch(
      `${process.env.API_BASE_URL}/api/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (apiRes.ok) {
      const data = await apiRes.json();
      return NextResponse.json({
        authenticated: true,
        user: data.data ?? data.user ?? data,
      });
    }

    // If the endpoint returns 401, the token is truly expired/invalid
    if (apiRes.status === 401) {
      cookieStore.set(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
  } catch {
    // Network error or endpoint doesn't exist — fall through
  }

  // Fallback: cookie exists but we can't validate via API
  // Treat as authenticated (the proxy will catch invalid tokens on actual API calls)
  return NextResponse.json({
    authenticated: true,
  });
}
