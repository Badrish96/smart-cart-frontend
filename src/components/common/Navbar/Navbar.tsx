'use client'

import { useState, useEffect, useSyncExternalStore, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Menu, X, LogOut, Heart, User as UserIcon } from 'lucide-react'
import SearchOverlay from '@/src/features/search/SearchOverlay'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { logoutThunk, selectAuth } from '@/src/store/slices/authSlice'
import { selectWishlistProductIds } from '@/src/store/slices/wishlistSlice'
import { ROUTES } from '@/src/routes'

interface NavbarProps {
  dict: {
    nav: {
      home: string
      explore: string
      contact: string
      login: string
      cart: string
    }
    wishlist: { nav_label: string }
    profile: { nav_label: string }
    search: {
      placeholder: string
      no_results: string
      no_results_hint: string
      loading: string
      close: string
      results_for: string
    }
  }
  lang: string
}

const useIsClient = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

function UserAvatar({ url, name, size = 32 }: { url?: string; name: string; size?: number }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center fw-semibold text-white flex-shrink-0 bg-accent"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function Navbar({ dict, lang }: NavbarProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user, token } = useAppSelector(selectAuth)
  const wishlistIds = useAppSelector(selectWishlistProductIds)

  const isClient = useIsClient()
  const isLoggedIn = isClient && !!token
  const isAdmin = isClient && user?.role === 'admin'
  const wishlistCount = isClient && isLoggedIn ? wishlistIds.length : 0

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    dispatch(logoutThunk())
    setMenuOpen(false)
    setProfileOpen(false)
    router.replace(ROUTES.home(lang))
  }

  const userNavLinks = [
    { label: dict.nav.home, href: ROUTES.home(lang) },
    { label: dict.nav.explore, href: ROUTES.products(lang) },
    { label: dict.nav.contact, href: ROUTES.contact(lang) },
  ]

  return (
    <>
    <nav className={['navbar-base', scrolled ? 'navbar-scrolled' : ''].join(' ')}>
      <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href={isAdmin ? ROUTES.adminDashboard(lang) : ROUTES.home(lang)} className="flex items-center gap-2">
            <div className="logo-icon-bg w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 3a9 9 0 100 18A9 9 0 0012 3zm0 2a4 4 0 110 8 4 4 0 010-8zm0 10a6.99 6.99 0 01-5.48-2.67C7.86 11.26 9.84 10.5 12 10.5s4.14.76 5.48 2.83A6.99 6.99 0 0112 15z" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="fw-extrabold fs-lg text-accent block logo-wordmark">SMARTCART</span>
              <span className="text-overline text-muted block">DIVE IN BEATS</span>
            </div>
          </Link>

          {/* Admin: just logout */}
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <span className="admin-badge hidden md:block">Admin Portal</span>
              <button type="button" onClick={handleLogout} className="navbar-icon-btn" aria-label="Sign out" title="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              {/* Desktop nav links */}
              <ul className="hidden md:flex items-center gap-8">
                {userNavLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="nav-link fs-base fw-medium">{link.label}</Link>
                  </li>
                ))}
              </ul>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                {/* Theme toggle */}
                <button
                  type="button"
                  onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                  className="toggle-track"
                  aria-label="Toggle theme"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon/Moon.svg" alt="" className="toggle-icon toggle-icon--moon" width={20} height={20} />
                  <div className={['toggle-thumb', theme === 'light' ? 'toggle-thumb--light' : ''].filter(Boolean).join(' ')} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon/Sun.svg" alt="" className="toggle-icon toggle-icon--sun" width={16} height={16} />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    className="navbar-icon-btn"
                    aria-label="Search"
                    onClick={() => setSearchOpen((v) => !v)}
                  >
                    <Search size={18} />
                  </button>
                  {searchOpen && (
                    <SearchOverlay
                      dict={dict.search}
                      lang={lang}
                      onClose={() => setSearchOpen(false)}
                    />
                  )}
                </div>

                {isLoggedIn && (
                  <Link
                    href={ROUTES.wishlist(lang)}
                    className="navbar-icon-btn relative"
                    aria-label={dict.wishlist.nav_label}
                    title={dict.wishlist.nav_label}
                  >
                    <Heart size={18} />
                    {wishlistCount > 0 && (
                      <span className="badge-accent absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] fw-bold flex items-center justify-center text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                )}

                <button type="button" className="navbar-icon-btn relative" aria-label="Cart">
                  <ShoppingCart size={18} />
                  <span className="badge-accent absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] fw-bold flex items-center justify-center text-white">3</span>
                </button>

                {/* Profile avatar / login — desktop */}
                {isLoggedIn && user ? (
                  <div ref={profileRef} className="relative navbar-desktop-only">
                    <button
                      type="button"
                      onClick={() => setProfileOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-80 cursor-pointer"
                      aria-label={dict.profile.nav_label}
                      title={user.name}
                    >
                      <UserAvatar url={user.profilePicture?.url} name={user.name} size={34} />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 profile-dropdown rounded-xl py-2 z-50">
                        <div className="px-4 py-2 border-b border-theme">
                          <p className="fs-sm fw-semibold text-primary truncate">{user.name}</p>
                          <p className="fs-xs text-muted truncate">{user.email}</p>
                        </div>
                        <Link
                          href={ROUTES.profile(lang)}
                          className="flex items-center gap-3 px-4 py-2.5 fs-sm text-secondary nav-link"
                          onClick={() => setProfileOpen(false)}
                        >
                          <UserIcon size={15} /> {dict.profile.nav_label}
                        </Link>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 fs-sm text-secondary nav-link"
                        >
                          <LogOut size={15} /> Sign out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={ROUTES.login(lang)} className="btn btn-outline btn-sm navbar-desktop-only">
                    {dict.nav.login}
                  </Link>
                )}

                {/* Mobile hamburger — hidden at md+ via SCSS (md:hidden fights .navbar-icon-btn display:flex) */}
                <button
                  type="button"
                  className="navbar-icon-btn navbar-hamburger"
                  onClick={() => setMenuOpen(v => !v)}
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>

              {/* Mobile menu */}
              {menuOpen && (
                <div className="md:hidden rounded-xl mb-4 p-4 flex flex-col gap-3 navbar-mobile-menu">
                  {/* User info row in mobile */}
                  {isLoggedIn && user && (
                    <div className="flex items-center gap-3 pb-3 border-b border-theme">
                      <UserAvatar url={user.profilePicture?.url} name={user.name} size={40} />
                      <div className="min-w-0">
                        <p className="fs-sm fw-semibold text-primary truncate">{user.name}</p>
                        <p className="fs-xs text-muted truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  {userNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="nav-link fs-base fw-medium"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {isLoggedIn ? (
                    <>
                      <Link
                        href={ROUTES.profile(lang)}
                        className="flex items-center gap-2 nav-link fs-base fw-medium"
                        onClick={() => setMenuOpen(false)}
                      >
                        <UserIcon size={16} /> {dict.profile.nav_label}
                      </Link>
                      <button type="button" onClick={handleLogout} className="btn btn-ghost btn-sm btn-block">
                        <LogOut size={14} /> Sign out
                      </button>
                    </>
                  ) : (
                    <Link href={ROUTES.login(lang)} className="btn btn-outline btn-sm btn-block" onClick={() => setMenuOpen(false)}>
                      {dict.nav.login}
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  </>
  )
}
