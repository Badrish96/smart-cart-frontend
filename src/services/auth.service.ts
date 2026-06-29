import httpClient from './httpClient'
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UserRole,
} from '@/src/types/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api/v1'
const AUTH_BASE = `${API_BASE}/auth`

interface BackendAuthEnvelope {
  success: boolean
  message: string
  data: {
    token: string
    user: {
      id: string
      name: string
      email: string
      role?: UserRole
      createdAt?: string
    }
  }
}

interface BackendMessageEnvelope {
  success: boolean
  message: string
}


function normaliseAuth(raw: BackendAuthEnvelope): AuthResponse {
  return {
    accessToken: raw.data.token,
    user: {
      id: raw.data.user.id,
      name: raw.data.user.name,
      email: raw.data.user.email,
      role: raw.data.user.role ?? 'user',
      createdAt: raw.data.user.createdAt,
    },
  }
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await httpClient.post<BackendAuthEnvelope>(`${AUTH_BASE}/login`, payload)
    return normaliseAuth(data)
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await httpClient.post<BackendAuthEnvelope>(`${AUTH_BASE}/register`, payload)
    return normaliseAuth(data)
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    const { data } = await httpClient.post<BackendMessageEnvelope>(
      `${AUTH_BASE}/forgot-password`,
      payload
    )
    return { message: data.message }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    const { data } = await httpClient.post<BackendMessageEnvelope>(
      `${AUTH_BASE}/reset-password/${payload.token}`,
      { password: payload.newPassword }
    )
    return { message: data.message }
  },

  async logout(): Promise<void> {
    try {
      await httpClient.post(`${AUTH_BASE}/logout`)
    } catch {
      // ignore logout errors — local state is already cleared
    }
  },
}
