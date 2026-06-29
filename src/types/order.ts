import type { ProductImage } from './product'

export type OrderStatus = 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid'

export interface OrderProduct {
  _id: string
  name: string
  images?: (ProductImage | string)[]
}

export interface OrderItem {
  _id?: string
  /** Populated product object from API */
  product?: OrderProduct
  /** Snapshot image URL returned directly by API */
  image?: string
  /** Snapshot name */
  name?: string
  quantity: number
  price: number
  discount?: number
  effectivePrice?: number
}

export interface ShippingAddress {
  label?: string
  fullName: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Order {
  _id: string
  user: string | { _id: string; name: string; email: string }
  items: OrderItem[]
  subtotal: number
  totalAmount?: number
  status: OrderStatus           // normalised from orderStatus by service layer
  paymentStatus: PaymentStatus
  paymentMethod?: string
  shippingAddress?: ShippingAddress
  orderNumber?: string
  createdAt: string
  updatedAt: string
}

export interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  pages: number
}
