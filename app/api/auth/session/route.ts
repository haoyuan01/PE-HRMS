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

  // Validate the token by calling the Laravel API
  const apiRes = await fetch(
    `${process.env.API_BASE_URL}/api/v1/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    // Token is invalid/expired — clear the cookie
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

  const data = await apiRes.json();

  return NextResponse.json({
    authenticated: true,
    user: data.data ?? data.user ?? data,
  });
}
