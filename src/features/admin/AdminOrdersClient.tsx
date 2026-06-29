'use client'

import { useEffect, useState } from 'react'
import { orderService } from '@/src/services/order.service'
import type { Order, OrderStatus } from '@/src/types/order'

const STATUSES: OrderStatus[] = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']


export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    orderService.adminGetOrders()
      .then(({ orders: o }) => setOrders(o))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId)
    try {
      const updated = await orderService.adminUpdateStatus(orderId, status)
      setOrders((prev) => prev.map((o) => o._id === orderId ? updated : o))
    } catch (err) { console.error(err) }
    finally { setUpdatingId(null) }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="card-glass rounded-xl h-16 bg-secondary" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return <p className="text-body-sm text-muted">No orders yet.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 fs-xs fw-semibold text-muted uppercase tracking-wide">
        <span>Order / Customer</span>
        <span>Items</span>
        <span>Total</span>
        <span>Status</span>
        <span>Payment</span>
      </div>

      {orders.map((order) => {
        const customer = typeof order.user === 'string' ? null : order.user
        return (
          <div
            key={order._id}
            className="card-glass rounded-xl p-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center"
          >
            <div>
              <p className="fs-sm fw-semibold text-primary">#{order._id.slice(-8).toUpperCase()}</p>
              {customer && <p className="fs-xs text-muted">{customer.name} · {customer.email}</p>}
              <p className="fs-xs text-muted">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <span className="fs-sm text-secondary">{order.items.length} items</span>

            <span className="fs-sm fw-bold text-accent">₹{order.subtotal.toFixed(2)}</span>

            {/* Status select */}
            <select
              className="dp-select fs-xs"
              value={order.status}
              disabled={updatingId === order._id || order.status === 'cancelled' || order.status === 'delivered'}
              onChange={(e) => handleStatusChange(order._id, e.target.value as OrderStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>

            <span className={`order-status-badge order-status-badge--${order.paymentStatus}`}>
              {order.paymentStatus}
            </span>
          </div>
        )
      })}
    </div>
  )
}
