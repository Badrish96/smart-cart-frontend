import type { ProductImage } from './product'

export interface CartProduct {
  _id: string
  name: string
  price: number
  discount?: number
  images: (ProductImage | string)[]
  stock?: number
  category?: string
}

export interface CartItem {
  _id: string
  productId?: CartProduct | string   // some API versions use this
  product?: CartProduct              // other API versions use this
  quantity: number
  price: number      // snapshotted at add time
  discount?: number  // snapshotted at add time
}

export interface Cart {
  _id: string
  user: string
  items: CartItem[]
  subtotal: number
}
