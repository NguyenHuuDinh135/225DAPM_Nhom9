import { NextRequest, NextResponse } from "next/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Call backend API
    const response = await fetch(`${BASE_URL}/api/users/login?useCookies=false&useSessionCookies=false`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    
    // Return token to client so it can be stored in localStorage
    return NextResponse.json({
        ...data,
        accessTokenForClient: data.accessToken  // Client will read this and save to localStorage
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    )
  }
}