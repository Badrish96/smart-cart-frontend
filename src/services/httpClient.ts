import axios, { AxiosError, AxiosResponse } from 'axios'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _startTime?: number
  }
}

/**
 * All requests use the internal proxy route at /api/proxy/*.
 * Next.js forwards them server-side to BACKEND_URL, so the browser
 * never makes a cross-origin call and CORS is not needed on the backend.
 *
 * Path on frontend  →  Path on backend
 * /api/proxy/auth/login  →  http://localhost:5000/auth/login
 *
 * Control the backend path prefix via NEXT_PUBLIC_API_BASE in .env.local.
 */
const httpClient = axios.create({
  baseURL: '/api/proxy',
  headers: { 'Content-Type': 'application/json' },
  // 30 s — gives slow backends (SSL negotiation, cold starts) time to respond
  // before the browser gives up. The proxy fetch timeout is set separately.
  timeout: 30000,
})

// ── Request interceptor ───────────────────────────────────────────────────────
httpClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1]
      if (token) config.headers.Authorization = `Bearer ${token}`
    }

    if (process.env.NODE_ENV === 'development') {
      config._startTime = Date.now()
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      console.debug(`[API] → ${config.method?.toUpperCase()} ${base}/api/proxy${config.url}`)
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ──────────────────────────────────────────────────────
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      const elapsed = Date.now() - (response.config._startTime ?? Date.now())
      console.debug(`[API] ← ${response.status} ${response.config.url} (${elapsed}ms)`)
    }
    return response
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.code === 'ERR_CANCELED') return Promise.reject(error)

    const status = error.response?.status

    // Never fire auth:unauthorized for the logout endpoint itself —
    // doing so would re-trigger logoutThunk and create an infinite loop
    // when the backend rejects an already-expired token during sign-out.
    const isLogoutRequest = (error.config?.url ?? '').includes('/auth/logout')

    if (status === 401 && !isLogoutRequest && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong'

    if (process.env.NODE_ENV === 'development') {
      console.error(`[API] ✗ ${status ?? 'network'} ${error.config?.url} — ${message}`)
    }

    return Promise.reject(new Error(message))
  }
)

export default httpClient
