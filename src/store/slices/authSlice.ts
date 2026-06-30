import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import Cookies from 'js-cookie'
import { authService } from '@/src/services/auth.service'
import { profileService } from '@/src/services/profile.service'
import { addToast } from './toastSlice'
import type {
  User,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from '@/src/types/auth'
import type { RootState } from '../store'

interface AuthState {
  user: User | null
  token: string | null
  isHydrated: boolean
  isLoading: boolean
  isFetchingProfile: boolean
  error: string | null
  forgotPasswordSuccess: boolean
  resetPasswordSuccess: boolean
}

const USER_COOKIE = 'sc_user'

function saveUser(user: User | null) {
  if (user) Cookies.set(USER_COOKIE, JSON.stringify(user), { expires: 7, sameSite: 'strict' })
  else Cookies.remove(USER_COOKIE)
}

// IMPORTANT: never read cookies here. This module evaluates on both the server
// (SSR — no cookies, no `document`) and the client (cookies present), so doing
// so makes the initial state diverge between environments and triggers a
// hydration mismatch (React error #418). Always start at null/null and let
// ReduxProvider's mount effect dispatch `hydrateAuth` once the client has
// painted the server-matching markup.
const initialState: AuthState = {
  user: null,
  token: null,
  isHydrated: false,
  isLoading: false,
  isFetchingProfile: false,
  error: null,
  forgotPasswordSuccess: false,
  resetPasswordSuccess: false,
}

// ── Thunks ────────────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue, dispatch }) => {
    try {
      const res = await authService.login(payload)
      Cookies.set('auth_token', res.accessToken, { expires: 7, sameSite: 'strict' })
      dispatch(addToast({ type: 'success', title: 'Welcome back!', message: `Signed in as ${res.user.email}` }))
      return res
    } catch (err: unknown) {
      const message = (err as Error).message
      dispatch(addToast({ type: 'error', title: 'Sign in failed', message }))
      return rejectWithValue(message)
    }
  }
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue, dispatch }) => {
    try {
      const res = await authService.register(payload)
      Cookies.set('auth_token', res.accessToken, { expires: 7, sameSite: 'strict' })
      dispatch(addToast({ type: 'success', title: 'Account created!', message: `Welcome to SmartCart, ${res.user.name}` }))
      return res
    } catch (err: unknown) {
      const message = (err as Error).message
      dispatch(addToast({ type: 'error', title: 'Registration failed', message }))
      return rejectWithValue(message)
    }
  }
)

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: ForgotPasswordPayload, { rejectWithValue, dispatch }) => {
    try {
      const res = await authService.forgotPassword(payload)
      return res
    } catch (err: unknown) {
      const message = (err as Error).message
      dispatch(addToast({ type: 'error', title: 'Could not send reset link', message }))
      return rejectWithValue(message)
    }
  }
)

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (payload: ResetPasswordPayload, { rejectWithValue, dispatch }) => {
    try {
      const res = await authService.resetPassword(payload)
      return res
    } catch (err: unknown) {
      const message = (err as Error).message
      dispatch(addToast({ type: 'error', title: 'Password reset failed', message }))
      return rejectWithValue(message)
    }
  }
)

export const fetchProfileThunk = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await profileService.getProfile()
    } catch (err: unknown) {
      return rejectWithValue((err as Error).message)
    }
  }
)

export const updateProfileThunk = createAsyncThunk(
  'auth/updateProfile',
  async (payload: UpdateProfilePayload | FormData, { rejectWithValue, dispatch }) => {
    try {
      const user = await profileService.updateProfile(payload)
      dispatch(addToast({ type: 'success', title: 'Profile updated', message: 'Your profile has been saved.' }))
      return user
    } catch (err: unknown) {
      const message = (err as Error).message
      dispatch(addToast({ type: 'error', title: 'Update failed', message }))
      return rejectWithValue(message)
    }
  }
)

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  // Remove the cookie BEFORE the API call so any re-entry triggered
  // by the httpClient interceptor finds no session and bails early.
  Cookies.remove('auth_token')
  await authService.logout()
  dispatch(addToast({ type: 'info', title: 'Signed out', message: 'You have been signed out successfully.' }))
})

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth(state, action: PayloadAction<{ user: User | null; token: string | null }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isHydrated = true
    },
    clearError(state) {
      state.error = null
    },
    clearFlags(state) {
      state.forgotPasswordSuccess = false
      state.resetPasswordSuccess = false
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginThunk.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.isHydrated = true
        state.user = action.payload.user
        state.token = action.payload.accessToken
        saveUser(action.payload.user)
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Register
    builder
      .addCase(registerThunk.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.isHydrated = true
        state.user = action.payload.user
        state.token = action.payload.accessToken
        saveUser(action.payload.user)
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Forgot password
    builder
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.isLoading = true; state.error = null; state.forgotPasswordSuccess = false
      })
      .addCase(forgotPasswordThunk.fulfilled, (state) => {
        state.isLoading = false; state.forgotPasswordSuccess = true
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })

    // Reset password
    builder
      .addCase(resetPasswordThunk.pending, (state) => {
        state.isLoading = true; state.error = null; state.resetPasswordSuccess = false
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        state.isLoading = false; state.resetPasswordSuccess = true
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.isLoading = false; state.error = action.payload as string
      })

    // Fetch profile (full user data including profilePicture, phone, addresses…)
    builder
      .addCase(fetchProfileThunk.pending, (state) => {
        state.isFetchingProfile = true
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.isFetchingProfile = false
        state.user = action.payload
        saveUser(action.payload)
      })
      .addCase(fetchProfileThunk.rejected, (state) => {
        state.isFetchingProfile = false
      })

    // Update profile
    builder
      .addCase(updateProfileThunk.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        saveUser(action.payload)
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null
      state.token = null
      state.isHydrated = true
      saveUser(null)
    })
  },
})

export const { hydrateAuth, clearError, clearFlags } = authSlice.actions
export default authSlice.reducer

export const selectAuth = (state: RootState) => state.auth
export const selectUser = (state: RootState) => state.auth.user
export const selectIsHydrated = (state: RootState) => state.auth.isHydrated
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token
export const selectIsFetchingProfile = (state: RootState) => state.auth.isFetchingProfile
