import { NextRequest, NextResponse } from "next/server"

/**
 * Protect all dashboard routes by requiring an auth-token cookie.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
