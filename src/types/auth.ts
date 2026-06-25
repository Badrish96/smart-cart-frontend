export type UserRole = 'user' | 'admin'
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export interface ProfilePicture {
  url: string
  publicId: string
}

export interface Address {
  _id: string
  label: string
  fullName: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export interface User {
  _id: string
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  profilePicture?: ProfilePicture
  dateOfBirth?: string
  gender?: Gender
  addresses?: Address[]
  createdAt?: string
}

export interface UpdateProfilePayload {
  name?: string
  phone?: string
  dateOfBirth?: string
  gender?: Gender
}

export type AddressPayload = Omit<Address, '_id' | 'isDefault'> & { isDefault?: boolean }

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
