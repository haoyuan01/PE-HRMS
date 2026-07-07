import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, USER_UUID_COOKIE_NAME, PERMISSIONS_COOKIE_NAME, EMPLOYMENT_COOKIE_NAME } from "@/lib/constants";
import { loggedFetch } from "@/lib/server-fetch";

export async function POST(request: NextRequest) {
  const { email, password, keepLoggedIn } = await request.json();

  const apiRes = await loggedFetch(
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

  // Extract and store permission codes from all roles
  const permissions = [
    ...new Set(
      (data.data.user.roles ?? []).flatMap(
        (role: { permissions: { code: string }[] }) =>
          role.permissions.map((p: { code: string }) => p.code)
      )
    ),
  ];

  cookieStore.set(PERMISSIONS_COOKIE_NAME, JSON.stringify(permissions), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(keepLoggedIn ? { maxAge: 30 * 24 * 60 * 60 } : {}),
  });

  // Store the employment manager/accountant flags
  const employment = data.data.user.employment ?? {};
  const employmentFlags = {
    is_manager: employment.is_manager === true,
    is_accountant: employment.is_accountant === true,
    is_director: employment.is_director === true,
  };

  cookieStore.set(EMPLOYMENT_COOKIE_NAME, JSON.stringify(employmentFlags), {
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
