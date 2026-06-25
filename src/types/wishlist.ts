import type { ProductImage } from './product'

// The API returns products directly inside wishlist.products[]
// Each element is the populated product object, not a wrapper
export interface WishlistProduct {
  _id: string
  name: string
  price: number
  discount?: number
  images: (ProductImage | string)[]
  category?: string
  stock?: number
  isActive?: boolean
}

export interface WishlistResponse {
  products: WishlistProduct[]
}
