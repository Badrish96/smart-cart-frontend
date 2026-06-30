import httpClient from './httpClient'
import type { User, UpdateProfilePayload, Address, AddressPayload } from '@/src/types/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api/v1'
const PROFILE_BASE = `${API_BASE}/profile`

interface ProfileEnvelope {
  success: boolean
  data: { user?: User; profile?: User } | User
}

function extractUser(raw: ProfileEnvelope): User {
  const d = raw.data
  if ('user' in d && d.user) return d.user
  if ('profile' in d && d.profile) return d.profile
  return d as User
}

interface AddressEnvelope {
  success: boolean
  data: { addresses?: Address[]; address?: Address; user?: User } | Address[]
}

function extractAddresses(raw: AddressEnvelope): Address[] {
  const d = raw.data
  if (Array.isArray(d)) return d
  if ('addresses' in d && d.addresses) return d.addresses
  if ('address' in d && d.address) return [d.address]
  return []
}

export const profileService = {
  async getProfile(): Promise<User> {
    const { data } = await httpClient.get<ProfileEnvelope>(PROFILE_BASE)
    return extractUser(data)
  },

  async updateProfile(payload: UpdateProfilePayload | FormData): Promise<User> {
    const isFormData = payload instanceof FormData
    // Must clear the default JSON Content-Type for FormData uploads so axios can
    // compute the multipart boundary itself — a hardcoded header has no boundary
    // and the backend's multer parser rejects the request.
    const { data } = await httpClient.put<ProfileEnvelope>(
      PROFILE_BASE,
      payload,
      isFormData ? { headers: { 'Content-Type': undefined } } : undefined
    )
    return extractUser(data)
  },

  async addAddress(payload: AddressPayload): Promise<Address[]> {
    const { data } = await httpClient.post<AddressEnvelope>(
      `${PROFILE_BASE}/addresses`,
      payload
    )
    return extractAddresses(data)
  },

  async updateAddress(addressId: string, payload: Partial<AddressPayload>): Promise<Address[]> {
    const { data } = await httpClient.put<AddressEnvelope>(
      `${PROFILE_BASE}/addresses/${addressId}`,
      payload
    )
    return extractAddresses(data)
  },

  async deleteAddress(addressId: string): Promise<void> {
    await httpClient.delete(`${PROFILE_BASE}/addresses/${addressId}`)
  },
}
