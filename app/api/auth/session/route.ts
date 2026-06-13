import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, USER_UUID_COOKIE_NAME, PERMISSIONS_COOKIE_NAME } from "@/lib/constants";
import { loggedFetch } from "@/lib/server-fetch";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  // Read permissions from cookie
  const permsCookie = cookieStore.get(PERMISSIONS_COOKIE_NAME)?.value;
  let permissions: string[] = [];
  if (permsCookie) {
    try {
      permissions = JSON.parse(permsCookie);
    } catch {
      // Ignore malformed cookie
    }
  }

  // Read user UUID from cookie and fetch full user data
  const uuid = cookieStore.get(USER_UUID_COOKIE_NAME)?.value;

  if (uuid) {
    try {
      const apiRes = await loggedFetch(
        `${process.env.API_BASE_URL}/api/v1/users/${uuid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (apiRes.ok) {
        const data = await apiRes.json();
        return NextResponse.json({
          authenticated: true,
          user: data.data,
          permissions,
        });
      }
    } catch {
      // If user fetch fails, fall back to authenticated-only
    }
  }

  return NextResponse.json({ authenticated: true, permissions });
}
