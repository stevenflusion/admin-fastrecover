"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const COOKIE_NAME = "auth-token"
const API_URL = "https://sh-api.happyground-63307e62.eastus.azurecontainerapps.io/api"

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (token) {
    try {
      await fetch(`${API_URL}/users/logout`, {
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

  cookieStore.delete(COOKIE_NAME)
  redirect("/")
}
