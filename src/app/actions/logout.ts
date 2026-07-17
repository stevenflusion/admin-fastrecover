"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const COOKIE_NAME = "auth-token"

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (token) {
    const apiUrl = process.env.API_URL
    if (apiUrl) {
      try {
        await fetch(`${apiUrl}/users/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
      } catch {
        // Ignore backend errors; the cookie is the source of truth for the UI.
      }
    }
  }

  cookieStore.delete(COOKIE_NAME)
  redirect("/")
}
