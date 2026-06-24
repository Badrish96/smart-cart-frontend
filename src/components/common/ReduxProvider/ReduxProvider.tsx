'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import Cookies from 'js-cookie'
import { store } from '@/src/store/store'
import { hydrateAuth, logoutThunk } from '@/src/store/slices/authSlice'
import { addToast } from '@/src/store/slices/toastSlice'

const USER_COOKIE = 'sc_user'

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hydrate auth state from cookies after mount.
    // initialState is always null/null so SSR and client render identically (no hydration mismatch).
    const token = Cookies.get('auth_token') ?? null
    const userRaw = Cookies.get(USER_COOKIE)
    const user = userRaw ? (() => { try { return JSON.parse(userRaw) } catch { return null } })() : null
    store.dispatch(hydrateAuth({ token, user }))

    const handleUnauthorized = () => {
      // Guard: if the session cookie is already gone, the user is already
      // logged out — skip to avoid re-triggering logoutThunk indefinitely.
      if (!Cookies.get('auth_token')) return

      store.dispatch(logoutThunk())
      store.dispatch(
        addToast({
          type: 'warning',
          title: 'Session expired',
          message: 'Please sign in again to continue.',
        })
      )
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  return <Provider store={store}>{children}</Provider>
}
