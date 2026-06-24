export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role?: UserRole
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken?: string
}

export interface ApiError {
  message: string
  statusCode?: number
}
