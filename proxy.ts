import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = ['en', 'hi']
const DEFAULT_LOCALE = 'en'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next.js internals, API routes, and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if the path already starts with a known locale
  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )

  if (!hasLocale) {
    // Detect preferred locale from Accept-Language header
    const acceptLang = request.headers.get('accept-language') ?? ''
    const preferred = LOCALES.find((l) => acceptLang.toLowerCase().includes(l)) ?? DEFAULT_LOCALE

    // Redirect /reset-password?token=xxx → /en/reset-password?token=xxx
    const url = request.nextUrl.clone()
    url.pathname = `/${preferred}${pathname}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
