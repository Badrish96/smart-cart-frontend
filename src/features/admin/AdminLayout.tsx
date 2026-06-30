'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PlusCircle, LayoutList, ClipboardList, UserCircle, LogOut, Moon, Sun } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { logoutThunk, selectAuth } from '@/src/store/slices/authSlice'
import { ROUTES } from '@/src/routes'

interface Props {
  children: React.ReactNode
  lang: string
}

export default function AdminLayout({ children, lang }: Props) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAppSelector(selectAuth)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleLogout = () => {
    dispatch(logoutThunk())
    router.replace(ROUTES.home(lang))
  }

  const navItems = [
    { href: ROUTES.adminAddProduct(lang), label: 'Add Product', icon: <PlusCircle size={18} /> },
    { href: ROUTES.adminProducts(lang),   label: 'All Products', icon: <LayoutList size={18} /> },
    { href: `/${lang}/admin/orders`,       label: 'Orders',       icon: <ClipboardList size={18} /> },
    { href: ROUTES.adminProfile(lang),     label: 'Profile',      icon: <UserCircle size={18} /> },
  ]

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Link href={ROUTES.home(lang)} className="flex items-center gap-2 link-plain min-w-0">
            <div className="logo-icon-bg admin-brand-icon flex items-center justify-center text-white fw-bold fs-base">S</div>
            <span className="fw-bold fs-lg text-primary admin-brand-text">SmartCart</span>
          </Link>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`admin-nav-item${active ? ' admin-nav-item--active' : ''}`}
              >
                {item.icon}
                <span className="admin-nav-label">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="admin-sidebar-footer">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="admin-theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="admin-footer-label">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>

          {user && (
            <Link href={ROUTES.adminProfile(lang)} className="admin-user-info link-plain" aria-label="View profile">
              <span className="admin-user-avatar" title={user.name}>{user.name.charAt(0).toUpperCase()}</span>
              <div className="flex flex-col min-w-0 admin-user-text">
                <span className="fs-sm fw-semibold text-primary">{user.name}</span>
                <span className="fs-xs text-muted admin-user-email">{user.email}</span>
              </div>
            </Link>
          )}

          <button type="button" onClick={handleLogout} className="admin-logout-btn" aria-label="Sign out">
            <LogOut size={16} />
            <span className="admin-footer-label">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">{children}</main>
    </div>
  )
}
