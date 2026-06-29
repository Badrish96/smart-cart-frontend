import httpClient from './httpClient'
import type { Cart, CartItem } from '@/src/types/cart'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api/v1'
const CART_BASE = `${API_BASE}/cart`

interface CartEnvelope {
  success: boolean
  data: { cart?: Cart; subtotal?: number } | Cart
}

function extractCart(raw: CartEnvelope): Cart {
  const d = raw.data
  if ('cart' in d && d.cart) return d.cart
  return d as Cart
}

export const cartService = {
  async getCart(): Promise<Cart> {
    const { data } = await httpClient.get<CartEnvelope>(CART_BASE)
    return extractCart(data)
  },

  async addItem(productId: string, quantity = 1): Promise<Cart> {
    const { data } = await httpClient.post<CartEnvelope>(`${CART_BASE}/items`, { productId, quantity })
    return extractCart(data)
  },

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    const { data } = await httpClient.put<CartEnvelope>(`${CART_BASE}/items/${itemId}`, { quantity })
    return extractCart(data)
  },

  async removeItem(itemId: string): Promise<Cart> {
    const { data } = await httpClient.delete<CartEnvelope>(`${CART_BASE}/items/${itemId}`)
    return extractCart(data)
  },

  async clearCart(): Promise<void> {
    await httpClient.delete(CART_BASE)
  },
}

/** Count total items in a cart */
export function cartItemCount(cart: Cart | null): number {
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}

/** Extract the product object from a CartItem (populated or string) */
export function cartItemProduct(item: CartItem) {
  return typeof item.productId === 'string' ? null : item.productId
}

/** Effective unit price after snapshot discount */
export function cartItemEffectivePrice(item: CartItem): number {
  return item.discount && item.discount > 0
    ? item.price * (1 - item.discount / 100)
    : item.price
}

/** Line total */
export function cartItemTotal(item: CartItem): number {
  return cartItemEffectivePrice(item) * item.quantity
}
