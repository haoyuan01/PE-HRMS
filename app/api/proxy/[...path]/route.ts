import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { loggedFetch } from "@/lib/server-fetch";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyRequest(request: NextRequest, { params }: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const { path } = await params;
  const apiPath = path.join("/");

  const url = new URL(request.url);
  const queryString = url.search;

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Forward body for non-GET requests
  let body: BodyInit | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      // Forward FormData as-is — let fetch set the boundary header
      body = await request.arrayBuffer();
      headers["Content-Type"] = contentType;
    } else {
      headers["Content-Type"] = "application/json";
      body = await request.text();
    }
  }

  const apiRes = await loggedFetch(
    `${process.env.API_BASE_URL}/api/v1/${apiPath}${queryString}`,
    {
      method: request.method,
      headers,
      body,
    }
  );

  const data = await apiRes.json();
  return NextResponse.json(data, { status: apiRes.status });
}

// Explicit named exports so Next.js reliably detects every supported method
// at build time (assigning a shared function to `export const GET` can be
// dropped from the production route manifest).
export async function GET(request: NextRequest, ctx: RouteContext) {
  return proxyRequest(request, ctx);
}
export async function POST(request: NextRequest, ctx: RouteContext) {
  return proxyRequest(request, ctx);
}
export async function PUT(request: NextRequest, ctx: RouteContext) {
  return proxyRequest(request, ctx);
}
export async function PATCH(request: NextRequest, ctx: RouteContext) {
  return proxyRequest(request, ctx);
}
export async function DELETE(request: NextRequest, ctx: RouteContext) {
  return proxyRequest(request, ctx);
}
