import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, USER_UUID_COOKIE_NAME } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const { email, password, keepLoggedIn } = await request.json();

  const apiRes = await fetch(
    `${process.env.API_BASE_URL}/api/v1/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await apiRes.json();

  if (!apiRes.ok) {
    return NextResponse.json(data, { status: apiRes.status });
  }

  const token = data.data.token.access_token;

  const cookieStore = await cookies();
  const userUuid = data.data.user.uuid;

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(keepLoggedIn ? { maxAge: 30 * 24 * 60 * 60 } : {}),
  });

  cookieStore.set(USER_UUID_COOKIE_NAME, userUuid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(keepLoggedIn ? { maxAge: 30 * 24 * 60 * 60 } : {}),
  });

  return NextResponse.json({
    success: data.success,
    message: data.message,
    data: {
      user: data.data.user,
    },
  });
}
