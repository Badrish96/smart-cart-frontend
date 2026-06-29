'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Headphones } from 'lucide-react'
import { orderService } from '@/src/services/order.service'
import Modal from '@/src/components/ui/Modal/Modal'
import Dropdown from '@/src/components/ui/Dropdown/Dropdown'
import type { Order, OrderStatus } from '@/src/types/order'
import { ROUTES } from '@/src/routes'

const CANCEL_REASONS = [
  'Changed my mind',
  'Found a better price elsewhere',
  'Ordered by mistake',
  'Delivery time is too long',
  'Want to change the delivery address',
  'Want to change the product',
  'Duplicate order placed',
  'Payment issue',
  'Other',
]

interface Dict {
  heading: string
  empty: string
  empty_sub: string
  browse: string
  order_id: string
  placed_on: string
  items_count: string
  subtotal: string
  status: string
  payment: string
  view_details: string
  cancel_order: string
  cancelling: string
  confirm_cancel: string
  status_placed: string
  status_confirmed: string
  status_shipped: string
  status_delivered: string
  status_cancelled: string
  payment_pending: string
  payment_paid: string
}

interface Props { lang: string; dict: Dict }

const STATUS_LABEL: Record<OrderStatus, keyof Dict> = {
  placed: 'status_placed',
  confirmed: 'status_confirmed',
  shipped: 'status_shipped',
  delivered: 'status_delivered',
  cancelled: 'status_cancelled',
}

export default function OrdersClient({ lang, dict }: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0])

  useEffect(() => {
    orderService.getOrders()
      .then(({ orders: o }) => setOrders(o))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async () => {
    if (!pendingCancelId) return
    const id = pendingCancelId
    setPendingCancelId(null)
    setCancellingId(id)
    try {
      const updated = await orderService.cancelOrder(id, cancelReason)
      setOrders((prev) => prev.map((o) => o._id === id ? updated : o))
    } catch (err) {
      console.error(err)
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 mt-24 pb-10">
        <div className="flex flex-col gap-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-glass rounded-2xl p-5 h-28 bg-secondary" />
          ))}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <Package size={64} className="text-muted" />
        <p className="text-h4 text-primary">{dict.empty}</p>
        <p className="text-body-sm text-secondary">{dict.empty_sub}</p>
        <Link href={ROUTES.products(lang)} className="btn btn-primary mt-2">{dict.browse}</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 max-sm:px-4 mt-24 pb-16">
      <h1 className="text-h2 text-primary mb-8">{dict.heading}</h1>

      <div className="flex flex-col gap-4">
        {orders.map((order) => {
          const canCancel = order.status === 'placed' || order.status === 'confirmed'
          const statusKey = STATUS_LABEL[order.status]
          return (
            <div key={order._id} className="card-glass rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <p className="fs-xs text-muted">{dict.order_id} #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="fs-xs text-muted mt-0.5">
                    {dict.placed_on} {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`order-status-badge order-status-badge--${order.status}`}>
                  {dict[statusKey] as string}
                </span>
              </div>

              {/* Product thumbnails */}
              {order.items.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {order.items.slice(0, 4).map((item, idx) => {
                    const imgUrl = item.image ?? (item.product?.images?.[0]
                      ? (typeof item.product.images[0] === 'string' ? item.product.images[0] : (item.product.images[0] as { url: string }).url)
                      : null)
                    const name = item.name ?? item.product?.name ?? 'Product'
                    return (
                      <div key={item._id ?? idx} className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                        {imgUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgUrl} alt={name} className="w-full h-full object-contain p-1.5" />
                        ) : (
                          <Headphones size={16} className="text-muted" />
                        )}
                      </div>
                    )
                  })}
                  {order.items.length > 4 && (
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center fs-xs text-muted">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-theme pt-3">
                <div>
                  <p className="fs-sm text-secondary">
                    {order.items.length} {dict.items_count} · ₹{order.subtotal.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {canCancel && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={cancellingId === order._id}
                      onClick={() => { setCancelReason(CANCEL_REASONS[0]); setPendingCancelId(order._id) }}
                    >
                      {cancellingId === order._id ? dict.cancelling : dict.cancel_order}
                    </button>
                  )}
                  <Link href={ROUTES.orderDetail(lang, order._id)} className="btn btn-outline btn-sm">
                    {dict.view_details}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        isOpen={!!pendingCancelId}
        onClose={() => setPendingCancelId(null)}
        title="Cancel Order"
        size="sm"
      >
        <p className="fs-sm text-secondary mb-4">
          Please let us know why you want to cancel this order.
        </p>
        <div className="mb-5">
          <Dropdown
            label="Reason"
            value={cancelReason}
            onChange={(val) => setCancelReason(val)}
            options={CANCEL_REASONS.map((r) => ({ value: r, label: r }))}
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setPendingCancelId(null)}
          >
            Keep Order
          </button>
          <button
            type="button"
            className="btn btn-cancel btn-sm"
            onClick={handleCancel}
          >
            Confirm Cancellation
          </button>
        </div>
      </Modal>
    </div>
  )
}
