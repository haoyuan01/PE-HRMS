import { NextRequest, NextResponse } from "next/server";
import { loggedFetch } from "@/lib/server-fetch";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  const apiRes = await loggedFetch(
    `${process.env.API_BASE_URL}/api/v1/auth/forgot-password-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  const data = await apiRes.json();

  return NextResponse.json(data, { status: apiRes.status });
}
