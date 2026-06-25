import httpClient from './httpClient'
import type { WishlistProduct, WishlistResponse } from '@/src/types/wishlist'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api/v1'
const WISHLIST_BASE = `${API_BASE}/wishlist`

interface BackendWishlistEnvelope {
  success: boolean
  data: {
    wishlist?: { products?: WishlistProduct[] }
    products?: WishlistProduct[]
  } | WishlistProduct[]
}

function extractWishlist(raw: BackendWishlistEnvelope): WishlistResponse {
  const d = raw.data
  if (Array.isArray(d)) return { products: d }
  if ('wishlist' in d && d.wishlist?.products) return { products: d.wishlist.products }
  if ('products' in d && Array.isArray(d.products)) return { products: d.products }
  return { products: [] }
}

export const wishlistService = {
  async getWishlist(): Promise<WishlistResponse> {
    const { data } = await httpClient.get<BackendWishlistEnvelope>(WISHLIST_BASE)
    return extractWishlist(data)
  },

  async addToWishlist(productId: string): Promise<WishlistResponse> {
    const { data } = await httpClient.post<BackendWishlistEnvelope>(`${WISHLIST_BASE}/${productId}`)
    return extractWishlist(data)
  },

  async removeFromWishlist(productId: string): Promise<WishlistResponse> {
    const { data } = await httpClient.delete<BackendWishlistEnvelope>(`${WISHLIST_BASE}/${productId}`)
    return extractWishlist(data)
  },
}
