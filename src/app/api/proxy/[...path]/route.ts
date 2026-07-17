import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = "https://sh-api.happyground-63307e62.eastus.azurecontainerapps.io/api"

const API_BASE = API_URL.endsWith("/") ? API_URL : `${API_URL}/`
const API_KEY = "55c9ff743d54395a4407eef0dd589db311275926c05cd1dad3540cd84963c715"

console.log("[PROXY] Boot — API_URL env:", API_URL)
console.log("[PROXY] Boot — API_KEY defined:", !!API_KEY)
console.log("[PROXY] Boot — computed API_BASE:", API_BASE)

/**
 * Generic API proxy route.
 *
 * All client-side requests are forwarded through here so the real API key
 * never leaves the server. The auth-token cookie is validated before
 * proxying to ensure only authenticated users can reach the backend.
 */
async function proxyRequest(
  request: NextRequest,
  method: string
): Promise<NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  console.log("[PROXY] Request", method, request.url, "token present:", !!token)

  if (!token) {
    console.warn("[PROXY] Rejected — missing auth-token cookie")
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  if (!API_URL || !API_KEY) {
    console.error("[PROXY] Rejected — server misconfiguration. API_URL:", API_URL, "API_KEY defined:", !!API_KEY)
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    )
  }

  // Extract the proxied path from the URL
  const { pathname, search } = new URL(request.url)
  const proxyPath = pathname.replace(/^\/api\/proxy/, "")
  const targetUrl = new URL(
    proxyPath.startsWith("/") ? proxyPath.slice(1) : proxyPath,
    API_BASE
  )
  targetUrl.search = search

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    "Authorization": `Bearer ${token}`,
  }

  let body: BodyInit | undefined
  if (method !== "GET" && method !== "HEAD") {
    body = await request.text()
  }

  console.log("[PROXY] Forwarding to", targetUrl.toString())

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method,
      headers,
      body: body || undefined,
    })

    console.log("[PROXY] Upstream response", upstream.status, targetUrl.toString())

    const responseBody = await upstream.text()

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    })
  } catch (err) {
    console.error("[PROXY] Upstream fetch failed:", err, "target:", targetUrl.toString())
    return NextResponse.json(
      { error: "Upstream unreachable" },
      { status: 502 }
    )
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, "GET")
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, "POST")
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, "PUT")
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, "PATCH")
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, "DELETE")
}
