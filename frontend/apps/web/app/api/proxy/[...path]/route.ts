import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const backendPath = "/" + path.join("/")
  const search = request.nextUrl.search
  const backendUrl = `${BACKEND}/api${backendPath}${search}`

  const cookieStore = await cookies()
  const tokenFromCookie = cookieStore.get("access_token")?.value
  const authHeader = request.headers.get("Authorization")
  const token = authHeader?.replace("Bearer ", "") || tokenFromCookie

  const headers: Record<string, string> = {}
  if (token) headers["Authorization"] = `Bearer ${token}`

  const contentType = request.headers.get("Content-Type")
  if (contentType) headers["Content-Type"] = contentType

  const init: RequestInit = { method: request.method, headers }

  if (!["GET", "HEAD"].includes(request.method)) {
    const body = await request.text()
    if (body) init.body = body
  }

  try {
    const res = await fetch(backendUrl, init)
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
    })
  } catch (err) {
    console.error("Proxy error:", backendUrl, err)
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 })
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
