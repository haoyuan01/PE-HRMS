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

  // Decode JWT payload to extract user UUID, then fetch full user data
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const uuid = payload.sub;

    if (uuid) {
      const apiRes = await fetch(
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
        });
      }
    }
  } catch {
    // If JWT decode or user fetch fails, fall back to authenticated-only
  }

  return NextResponse.json({ authenticated: true });
}
