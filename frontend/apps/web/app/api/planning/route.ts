import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("access_token")?.value

    const response = await fetch(`${BASE_URL}/api/planning`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: await response.text() },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Planning GET error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("access_token")?.value
    const body = await request.json()

    console.log("📤 Proxying POST /api/planning to backend")
    console.log("🔑 Token exists:", !!token)
    console.log("📦 Body:", body)

    const response = await fetch(`${BASE_URL}/api/planning`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })

    console.log("📡 Backend response:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Backend error:", errorText)
      return NextResponse.json(
        { error: errorText || response.statusText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("✅ Success:", data)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("❌ Planning POST error:", error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
