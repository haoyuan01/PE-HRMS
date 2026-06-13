import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { loggedFetch } from "@/lib/server-fetch";

// Internal query param the client uses to pass the target backend path.
// We use a single static route (not a [...path] catch-all) because Vercel's
// build can fail to register catch-all route handlers, returning a 404.
const PATH_PARAM = "__path";

async function proxyRequest(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const incoming = new URL(request.url);
  const apiPath = (incoming.searchParams.get(PATH_PARAM) ?? "").replace(/^\/+/, "");

  // Forward every query param except our internal one to the backend.
  const forwardParams = new URLSearchParams(incoming.searchParams);
  forwardParams.delete(PATH_PARAM);
  const queryString = forwardParams.toString();
  const suffix = queryString ? `?${queryString}` : "";

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
      // Forward FormData as-is — let fetch keep the original boundary header
      body = await request.arrayBuffer();
      headers["Content-Type"] = contentType;
    } else {
      headers["Content-Type"] = "application/json";
      body = await request.text();
    }
  }

  const apiRes = await loggedFetch(
    `${process.env.API_BASE_URL}/api/v1/${apiPath}${suffix}`,
    {
      method: request.method,
      headers,
      body,
    }
  );

  const data = await apiRes.json();
  return NextResponse.json(data, { status: apiRes.status });
}

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}
export async function POST(request: NextRequest) {
  return proxyRequest(request);
}
export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}
export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}
export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}
