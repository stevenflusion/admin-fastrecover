// Thin fetch wrapper for the SH Fast Recover admin panel API.
// Client-side requests are proxied through /api/proxy so the API key never
// leaves the server. Server-side requests go directly to the backend.

const isServer = typeof window === "undefined"

const API_URL = "https://sh-api.happyground-63307e62.eastus.azurecontainerapps.io/api"
const API_KEY = "55c9ff743d54395a4407eef0dd589db311275926c05cd1dad3540cd84963c715"

const API_BASE = isServer ? API_URL : "/api/proxy"

const SERVER_API_KEY = isServer ? API_KEY : undefined

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

function ensureConfig(): void {
  if (!API_BASE) {
    throw new ApiError(0, "Configuración incompleta: falta API_URL")
  }
  if (isServer && !SERVER_API_KEY) {
    throw new ApiError(0, "Configuración incompleta: falta API_KEY")
  }
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const base = API_BASE.endsWith("/") ? API_BASE : `${API_BASE}/`
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path

  // When client-side, API_BASE is relative ("/api/proxy"). new URL()
  // requires an absolute base in the browser, so we concatenate manually.
  const isRelativeBase = base.startsWith("/")

  let urlString: string
  if (isRelativeBase) {
    urlString = `${base}${normalizedPath}`
  } else {
    const url = new URL(normalizedPath, base)
    urlString = url.toString()
  }

  if (params && Object.keys(params).length > 0) {
    const url = new URL(urlString, "http://localhost")
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value)
      }
    })
    urlString = isRelativeBase
      ? `${url.pathname}${url.search}`
      : `${url.origin}${url.pathname}${url.search}`
  }

  return urlString
}

async function parseError(response: Response): Promise<ApiError> {
  const status = response.status
  let message = ""

  try {
    const body = await response.json()
    message =
      typeof body.message === "string"
        ? body.message
        : typeof body.error === "string"
          ? body.error
          : JSON.stringify(body)
  } catch {
    message = await response.text()
  }

  if (status === 404) {
    message = "No encontrado"
  } else if (status === 409) {
    message = "Conflicto"
  } else if (status === 422) {
    if (!message || message === "{}") message = "Error de validación"
  }

  return new ApiError(status, message || "Error en la solicitud")
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (isServer && SERVER_API_KEY) {
    headers["x-api-key"] = SERVER_API_KEY
  }
  return headers
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  ensureConfig()

  try {
    const url = buildUrl(path, params)
    console.log("[API-CLIENT] GET", url)
    const response = await fetch(url, {
      method: "GET",
      headers: buildHeaders(),
    })

    console.log("[API-CLIENT] GET response", response.status, url)

    if (!response.ok) {
      throw await parseError(response)
    }

    return response.json() as Promise<T>
  } catch (error) {
    console.error("[API-CLIENT] GET failed:", error, "path:", path)
    if (error instanceof ApiError) throw error
    throw new ApiError(0, "Error de conexión")
  }
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  ensureConfig()

  try {
    const url = buildUrl(path)
    console.log("[API-CLIENT] POST", url)
    const response = await fetch(url, {
      method: "POST",
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })

    console.log("[API-CLIENT] POST response", response.status, url)

    if (!response.ok) {
      throw await parseError(response)
    }

    return response.json() as Promise<T>
  } catch (error) {
    console.error("[API-CLIENT] POST failed:", error, "path:", path)
    if (error instanceof ApiError) throw error
    throw new ApiError(0, "Error de conexión")
  }
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  ensureConfig()

  try {
    const url = buildUrl(path)
    console.log("[API-CLIENT] PUT", url)
    const response = await fetch(url, {
      method: "PUT",
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })

    console.log("[API-CLIENT] PUT response", response.status, url)

    if (!response.ok) {
      throw await parseError(response)
    }

    return response.json() as Promise<T>
  } catch (error) {
    console.error("[API-CLIENT] PUT failed:", error, "path:", path)
    if (error instanceof ApiError) throw error
    throw new ApiError(0, "Error de conexión")
  }
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  ensureConfig()

  try {
    const url = buildUrl(path)
    console.log("[API-CLIENT] PATCH", url)
    const response = await fetch(url, {
      method: "PATCH",
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })

    console.log("[API-CLIENT] PATCH response", response.status, url)

    if (!response.ok) {
      throw await parseError(response)
    }

    return response.json() as Promise<T>
  } catch (error) {
    console.error("[API-CLIENT] PATCH failed:", error, "path:", path)
    if (error instanceof ApiError) throw error
    throw new ApiError(0, "Error de conexión")
  }
}

export async function apiDelete<T>(path: string): Promise<T> {
  ensureConfig()

  try {
    const url = buildUrl(path)
    console.log("[API-CLIENT] DELETE", url)
    const response = await fetch(url, {
      method: "DELETE",
      headers: buildHeaders(),
    })

    console.log("[API-CLIENT] DELETE response", response.status, url)

    if (!response.ok) {
      throw await parseError(response)
    }

    return response.json() as Promise<T>
  } catch (error) {
    console.error("[API-CLIENT] DELETE failed:", error, "path:", path)
    if (error instanceof ApiError) throw error
    throw new ApiError(0, "Error de conexión")
  }
}
