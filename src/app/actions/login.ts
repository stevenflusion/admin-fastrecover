"use server"

import { cookies } from "next/headers"

const COOKIE_NAME = "auth-token"
const EIGHT_HOURS_IN_SECONDS = 8 * 60 * 60

const API_KEY = "55c9ff743d54395a4407eef0dd589db311275926c05cd1dad3540cd84963c715"
const API_URL = "https://sh-api.happyground-63307e62.eastus.azurecontainerapps.io/api"

export type LoginState = {
  success: boolean
  error?: string
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email")?.toString().trim() ?? ""
  const password = formData.get("password")?.toString() ?? ""

  if (!email || !password) {
    return { success: false, error: "Por favor completa todos los campos." }
  }

  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        email_user: email,
        password_user: password,
      }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: "Email o contraseña incorrectos." }
      }
      if (response.status === 403) {
        return { success: false, error: "Tu cuenta está inactiva. Contacta al administrador." }
      }
      if (response.status === 500) {
        return { success: false, error: "Error del servidor. Intenta de nuevo más tarde." }
      }
      return { success: false, error: "No se pudo iniciar sesión. Verifica tus credenciales." }
    }

    const data = (await response.json()) as { token?: string }
    const token = data.token

    if (!token) {
      return { success: false, error: "Respuesta inválida del servidor." }
    }

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: EIGHT_HOURS_IN_SECONDS,
      path: "/",
    })

    return { success: true }
  } catch {
    return { success: false, error: "No se pudo conectar al servidor. Verifica tu conexión." }
  }
}
