import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
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

  const apiRes = await fetch(
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

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
