import { NextRequest, NextResponse } from 'next/server'

/**
 * Transparent server-side proxy.
 * Browser  →  /api/proxy/<path>
 * Next.js  →  BACKEND_URL/<path>   (server-to-server, no CORS)
 *
 * Uses arrayBuffer so binary multipart/form-data is preserved exactly.
 */
const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:5000').replace(/\/$/, '')

type Context = { params: Promise<{ path: string[] }> }

async function proxy(request: NextRequest, { params }: Context) {
  const { path } = await params
  const targetUrl = `${BACKEND_URL}/${path.join('/')}`

  // Read body as raw bytes — safe for JSON, text, and multipart/form-data
  const body =
    request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.arrayBuffer()
      : undefined

  // Forward content-type (must include multipart boundary when present)
  // and authorization headers
  const forwardedHeaders = new Headers()
  const ct   = request.headers.get('content-type')
  const auth = request.headers.get('authorization')
  if (ct)   forwardedHeaders.set('content-type', ct)
  if (auth) forwardedHeaders.set('authorization', auth)

  console.debug(`[Proxy] ${request.method} → ${targetUrl}`)

  let backendRes: Response
  try {
    backendRes = await fetch(targetUrl, {
      method:  request.method,
      headers: forwardedHeaders,
      body,
      signal: AbortSignal.timeout(30000),
    })
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError'
    console.error(`[Proxy] ${isTimeout ? 'Timed out' : 'Unreachable'} — ${targetUrl}`)
    return NextResponse.json(
      { message: isTimeout ? 'Request timed out' : 'Backend unavailable' },
      { status: 503 }
    )
  }

  const text = await backendRes.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    json = { message: text }
  }

  if (!backendRes.ok) {
    console.warn(`[Proxy] Backend ${backendRes.status} for ${targetUrl}:`, json)
  }

  return NextResponse.json(json, { status: backendRes.status })
}

export const GET    = proxy
export const POST   = proxy
export const PUT    = proxy
export const PATCH  = proxy
export const DELETE = proxy
