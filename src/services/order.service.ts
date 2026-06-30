import httpClient from './httpClient'
import type {
  Order, OrdersResponse, ShippingAddress, OrderStatus,
  PaymentMethod, CheckoutResult, RazorpayOrderInfo, VerifyPaymentPayload,
} from '@/src/types/order'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api/v1'
const ORDERS_BASE = `${API_BASE}/orders`

interface OrderEnvelope {
  success: boolean
  data: { order?: Order } | Order
}

interface CheckoutEnvelope {
  success: boolean
  data: { order?: Order; razorpay?: RazorpayOrderInfo } | Order
}

interface OrdersEnvelope {
  success: boolean
  data: { orders?: Order[]; total?: number; page?: number; pages?: number } | Order[]
}

function normalizeOrder(order: Order): Order {
  // API returns status as `orderStatus`, not `status`
  const raw = (order as unknown as Record<string, string>).orderStatus ?? order.status
  return { ...order, status: raw?.toLowerCase() as Order['status'] }
}

function extractOrder(raw: OrderEnvelope): Order {
  const d = raw.data
  const order = ('order' in d && d.order) ? d.order : d as Order
  return normalizeOrder(order)
}

function extractCheckoutResult(raw: CheckoutEnvelope): CheckoutResult {
  const d = raw.data
  const rawOrder = ('order' in d && d.order) ? d.order : d as Order
  const razorpay = 'razorpay' in d ? d.razorpay : undefined
  return { order: normalizeOrder(rawOrder), razorpay }
}

function extractOrders(raw: OrdersEnvelope): OrdersResponse {
  const d = raw.data
  if (Array.isArray(d)) return { orders: d.map(normalizeOrder), total: d.length, page: 1, pages: 1 }
  return {
    orders: ((d as { orders?: Order[] }).orders ?? []).map(normalizeOrder),
    total: (d as { total?: number }).total ?? 0,
    page: (d as { page?: number }).page ?? 1,
    pages: (d as { pages?: number }).pages ?? 1,
  }
}

export const orderService = {
  /** User: place order from current cart. paymentMethod defaults to COD on the backend if omitted. */
  async checkout(shippingAddress?: ShippingAddress, paymentMethod?: PaymentMethod): Promise<CheckoutResult> {
    const payload: Record<string, unknown> = {}
    if (shippingAddress) payload.shippingAddress = shippingAddress
    if (paymentMethod) payload.paymentMethod = paymentMethod
    const { data } = await httpClient.post<CheckoutEnvelope>(ORDERS_BASE, payload)
    return extractCheckoutResult(data)
  },

  /** User: verify a completed Razorpay payment for an order */
  async verifyPayment(orderId: string, payload: VerifyPaymentPayload): Promise<Order> {
    const { data } = await httpClient.post<OrderEnvelope>(`${ORDERS_BASE}/${orderId}/verify-payment`, payload)
    return extractOrder(data)
  },

  /** User: get a fresh Razorpay order to retry payment on an existing unpaid order */
  async retryPayment(orderId: string): Promise<CheckoutResult> {
    const { data } = await httpClient.post<CheckoutEnvelope>(`${ORDERS_BASE}/${orderId}/retry-payment`)
    return extractCheckoutResult(data)
  },

  /** User: my orders */
  async getOrders(status?: string, page = 1): Promise<OrdersResponse> {
    const params = new URLSearchParams({ page: String(page) })
    if (status) params.append('status', status)
    const { data } = await httpClient.get<OrdersEnvelope>(`${ORDERS_BASE}?${params}`)
    return extractOrders(data)
  },

  /** User: single order */
  async getOrder(id: string): Promise<Order> {
    const { data } = await httpClient.get<OrderEnvelope>(`${ORDERS_BASE}/${id}`)
    return extractOrder(data)
  },

  /** User: cancel order */
  async cancelOrder(id: string, reason = 'Cancelled by customer'): Promise<Order> {
    const { data } = await httpClient.post<OrderEnvelope>(`${ORDERS_BASE}/${id}/cancel`, { reason })
    return extractOrder(data)
  },

  /** Admin: all orders */
  async adminGetOrders(page = 1): Promise<OrdersResponse> {
    const params = new URLSearchParams({ page: String(page) })
    const { data } = await httpClient.get<OrdersEnvelope>(`${ORDERS_BASE}/admin/all?${params}`)
    return extractOrders(data)
  },

  /** Admin: update order status */
  async adminUpdateStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data } = await httpClient.put<OrderEnvelope>(`${ORDERS_BASE}/admin/${id}/status`, { status })
    return extractOrder(data)
  },
}
