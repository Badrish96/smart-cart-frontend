'use client'

import React, { useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Menu, X, LogOut } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { logoutThunk, selectAuth } from '@/src/store/slices/authSlice'
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
  }
  lang: string
}

const useIsClient = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

export default function Navbar({ dict, lang }: NavbarProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user, token } = useAppSelector(selectAuth)

  const isClient  = useIsClient()
  const isLoggedIn = isClient && !!token
  const isAdmin    = isClient && user?.role === 'admin'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    dispatch(logoutThunk())
    setMenuOpen(false)
    router.replace(ROUTES.home(lang))
  }

  // Regular-user nav links
  const userNavLinks = [
    { label: dict.nav.home,    href: ROUTES.home(lang) },
    { label: dict.nav.explore, href: ROUTES.products(lang) },
    { label: dict.nav.contact, href: `/${lang}/contact` },
  ]

  return (
    <nav className={['navbar-base', scrolled ? 'navbar-scrolled' : ''].join(' ')}>
      <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link href={isAdmin ? ROUTES.adminDashboard(lang) : ROUTES.home(lang)} className="flex items-center gap-2">
            <div className="logo-icon-bg w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 3a9 9 0 100 18A9 9 0 0012 3zm0 2a4 4 0 110 8 4 4 0 010-8zm0 10a6.99 6.99 0 01-5.48-2.67C7.86 11.26 9.84 10.5 12 10.5s4.14.76 5.48 2.83A6.99 6.99 0 0112 15z"/>
              </svg>
            </div>
            <div className="leading-tight">
              <span className="fw-extrabold fs-lg text-accent block logo-wordmark">SMARTCART</span>
              <span className="text-overline text-muted block">DIVE IN BEATS</span>
            </div>
          </Link>

          {/* Admin: no regular nav, no cart — just logout */}
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <span className="admin-badge hidden md:block">Admin Portal</span>
              <button type="button" onClick={handleLogout} className="navbar-icon-btn" aria-label="Sign out" title="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              {/* Regular user / guest desktop nav */}
              <ul className="hidden md:flex items-center gap-8">
                {userNavLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="nav-link fs-base fw-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Right controls (guest + user only) */}
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

                <button type="button" className="navbar-icon-btn" aria-label="Search">
                  <Search size={18} />
                </button>

                <button type="button" className="navbar-icon-btn relative" aria-label="Cart">
                  <ShoppingCart size={18} />
                  <span className="badge-accent absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] fw-bold flex items-center justify-center text-white">3</span>
                </button>

                {isLoggedIn ? (
                  <button type="button" onClick={handleLogout} className="navbar-icon-btn hidden md:flex" aria-label="Sign out" title="Sign out">
                    <LogOut size={18} />
                  </button>
                ) : (
                  <Link href={ROUTES.login(lang)} className="btn btn-outline btn-sm hidden md:flex">
                    {dict.nav.login}
                  </Link>
                )}

                {/* Mobile hamburger */}
                <button
                  type="button"
                  className="md:hidden navbar-icon-btn"
                  onClick={() => setMenuOpen(v => !v)}
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>

              {/* Mobile menu */}
              {menuOpen && (
                <div className="md:hidden card-glass rounded-xl mb-4 p-4 flex flex-col gap-3 navbar-mobile-menu">
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
                    <button type="button" onClick={handleLogout} className="btn btn-ghost btn-sm btn-block">
                      <LogOut size={14} /> Sign out
                    </button>
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
  )
}
