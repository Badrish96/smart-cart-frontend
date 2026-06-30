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

export type PaymentMethod = 'COD' | 'Razorpay'

export interface Order {
  _id: string
  user: string | { _id: string; name: string; email: string }
  items: OrderItem[]
  subtotal: number
  totalAmount?: number
  status: OrderStatus           // normalised from orderStatus by service layer
  paymentStatus: PaymentStatus | 'failed'
  paymentMethod?: PaymentMethod | string
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

/** Razorpay order details returned by checkout when paymentMethod === 'Razorpay' */
export interface RazorpayOrderInfo {
  orderId: string
  amount: number
  currency: string
  keyId: string
}

export interface CheckoutResult {
  order: Order
  razorpay?: RazorpayOrderInfo
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}
