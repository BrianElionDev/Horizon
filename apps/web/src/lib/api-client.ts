import type { ApiResponse, ApiError } from '@horizon/shared'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

function processQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve)
    })
  }

  isRefreshing = true
  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) {
      processQueue(null)
      return null
    }
    const json = (await res.json()) as ApiResponse<{ accessToken: string }>
    const token = json.data.accessToken

    // Dynamically import to avoid circular dep — store is not a module dep of api-client
    const { useAuthStore } = await import('@/stores/auth')
    useAuthStore.getState().setAccessToken(token)

    processQueue(token)
    return token
  } catch {
    processQueue(null)
    return null
  } finally {
    isRefreshing = false
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<T> {
  const { useAuthStore } = await import('@/stores/auth')
  const accessToken = useAuthStore.getState().accessToken

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return request<T>(path, init, false)
    } else {
      const { useRouter } = await import('next/navigation')
      // Redirect to login — handled by caller in practice
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const err = (await res.json()) as ApiError
    throw err
  }

  const json = (await res.json()) as ApiResponse<T>
  return json.data
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
