import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Call backend API
    const response = await fetch(`${BASE_URL}/api/Users/login?useCookies=false&useSessionCookies=false`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    
    // Set cookie from server-side
    const cookieStore = await cookies()
    cookieStore.set("access_token", data.accessToken, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: data.expiresIn || 3600,
      path: "/",
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
