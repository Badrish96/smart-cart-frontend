'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import Cookies from 'js-cookie'
import { store } from '@/src/store/store'
import { hydrateAuth, logoutThunk, fetchProfileThunk } from '@/src/store/slices/authSlice'
import { fetchWishlistThunk } from '@/src/store/slices/wishlistSlice'
import { addToast } from '@/src/store/slices/toastSlice'

const USER_COOKIE = 'sc_user'

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hydrate from cookies on mount (covers page refresh / direct URL visits).
    const token = Cookies.get('auth_token') ?? null
    const userRaw = Cookies.get(USER_COOKIE)
    const user = userRaw ? (() => { try { return JSON.parse(userRaw) } catch { return null } })() : null
    store.dispatch(hydrateAuth({ token, user }))
    if (token) {
      store.dispatch(fetchProfileThunk())
      store.dispatch(fetchWishlistThunk())
    }

    // Watch for login/register during this session: when a token transitions
    // from null → value (user just logged in), fetch full profile + wishlist
    // so the navbar avatar and data update immediately without a page refresh.
    //
    // IMPORTANT: prevToken must be updated BEFORE dispatching. Redux notifies
    // subscribers synchronously inside dispatch(), so dispatching inside a
    // subscriber re-enters it before `prevToken = nextToken` is reached,
    // causing infinite recursion if prevToken is still the old value.
    let prevToken: string | null = store.getState().auth.token
    const unsubscribe = store.subscribe(() => {
      const nextToken = store.getState().auth.token
      if (nextToken && nextToken !== prevToken) {
        prevToken = nextToken          // ← update BEFORE dispatching
        store.dispatch(fetchProfileThunk())
        store.dispatch(fetchWishlistThunk())
      } else {
        prevToken = nextToken
      }
    })

    const handleUnauthorized = () => {
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
    return () => {
      unsubscribe()
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  return <Provider store={store}>{children}</Provider>
}
