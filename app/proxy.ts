import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'hi']
const defaultLocale = 'en'

const protectedPaths = ['/dashboard', '/admin']

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || ''
  const preferred = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
  return locales.includes(preferred) ? preferred : defaultLocale
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(request.nextUrl)
  }

  const locale = locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  )
  const pathWithoutLocale = locale
    ? pathname.slice(`/${locale}`.length) || '/'
    : pathname

  const isProtected = protectedPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  )

  if (isProtected) {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
}
