'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Headphones, CreditCard, Truck, MapPin, AlertCircle } from 'lucide-react'
import { orderService } from '@/src/services/order.service'
import Modal from '@/src/components/ui/Modal/Modal'
import Dropdown from '@/src/components/ui/Dropdown/Dropdown'
import { useRazorpayScript } from '@/src/hooks/useRazorpayScript'
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
  order_id: string
  placed_on: string
  status: string
  payment: string
  subtotal: string
  shipping_to: string
  cancel_order: string
  cancelling: string
  confirm_cancel: string
  back_to_orders: string
  status_placed: string
  status_confirmed: string
  status_shipped: string
  status_delivered: string
  status_cancelled: string
  payment_pending: string
  payment_paid: string
}

interface Props { id: string; lang: string; dict: Dict }

const STATUS_LABEL: Record<OrderStatus, keyof Dict> = {
  placed: 'status_placed',
  confirmed: 'status_confirmed',
  shipped: 'status_shipped',
  delivered: 'status_delivered',
  cancelled: 'status_cancelled',
}

export default function OrderDetailClient({ id, lang, dict }: Props) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0])
  const [retrying, setRetrying] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)
  const razorpayReady = useRazorpayScript()

  useEffect(() => {
    orderService.getOrder(id)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!order) return
    setCancelling(true)
    setShowCancelModal(false)
    try {
      const updated = await orderService.cancelOrder(order._id, cancelReason)
      setOrder(updated)
    } catch (err) { console.error(err) }
    finally { setCancelling(false) }
  }

  const handleRetryPayment = async () => {
    if (!order || !razorpayReady) return
    setRetryError(null)
    setRetrying(true)
    try {
      const { razorpay } = await orderService.retryPayment(order._id)
      if (!razorpay) throw new Error('Could not start payment')

      const rzp = new window.Razorpay({
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        order_id: razorpay.orderId,
        name: 'SmartCart',
        description: `Order #${order._id.slice(-8).toUpperCase()}`,
        prefill: {},
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            const updated = await orderService.verifyPayment(order._id, response)
            setOrder(updated)
          } catch {
            setRetryError('We could not verify your payment. Please try again.')
          } finally {
            setRetrying(false)
          }
        },
        modal: {
          ondismiss: () => setRetrying(false),
        },
      })
      rzp.open()
    } catch (err) {
      setRetryError((err as Error).message)
      setRetrying(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 mt-24 pb-10 animate-pulse flex flex-col gap-4">
        <div className="h-6 rounded bg-secondary w-1/3" />
        <div className="card-glass rounded-2xl p-6 h-40 bg-secondary" />
        <div className="card-glass rounded-2xl p-6 h-32 bg-secondary" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-h4 text-primary">Order not found.</p>
        <Link href={ROUTES.orders(lang)} className="btn btn-outline mt-2">{dict.back_to_orders}</Link>
      </div>
    )
  }

  const statusKey = STATUS_LABEL[order.status]
  const canCancel = order.status === 'placed' || order.status === 'confirmed'
  const canRetryPayment =
    order.paymentMethod === 'Razorpay' &&
    order.paymentStatus !== 'paid' &&
    order.status !== 'cancelled'

  return (
    <div className="max-w-2xl mx-auto px-6 max-sm:px-4 mt-24 pb-16">
      {/* Back */}
      <Link href={ROUTES.orders(lang)} className="flex items-center gap-2 fs-sm text-muted nav-link mb-6">
        <ArrowLeft size={15} /> {dict.back_to_orders}
      </Link>

      {/* Success banner for newly placed orders */}
      {order.status === 'placed' && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6 border" style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' }}>
          <CheckCircle size={22} style={{ color: '#22c55e' }} />
          <div>
            <p className="fs-sm fw-semibold" style={{ color: '#22c55e' }}>Order confirmed!</p>
            <p className="fs-xs text-muted">Your order is confirmed. We&apos;ll update you when it ships.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="card-glass rounded-2xl p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-h4 text-primary mb-1">{dict.order_id} #{order._id.slice(-8).toUpperCase()}</p>
              <p className="fs-xs text-muted">
                {dict.placed_on} {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <span className={`order-status-badge order-status-badge--${order.status}`}>
                {dict[statusKey] as string}
              </span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card-glass rounded-2xl p-5">
          <h3 className="fs-sm fw-semibold text-primary mb-4">Items Ordered</h3>
          <div className="flex flex-col gap-4">
            {order.items.map((item, idx) => {
              const imgUrl: string | null = item.image
                ?? (item.product?.images?.[0]
                  ? (typeof item.product.images[0] === 'string' ? item.product.images[0] : (item.product.images[0] as { url: string }).url)
                  : null)
              const displayName = item.name ?? item.product?.name ?? 'Product'
              const effectivePrice = item.effectivePrice
                ?? (!!item.discount && item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price)

              return (
                <div key={item._id ?? idx} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                    {imgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgUrl} alt={displayName} className="w-full h-full object-contain p-2" />
                    ) : (
                      <Headphones size={22} className="text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="fs-sm fw-medium text-primary truncate">{displayName}</p>
                    <p className="fs-xs text-muted">×{item.quantity} · ₹{effectivePrice.toFixed(2)} each</p>
                    {!!item.discount && item.discount > 0 && (
                      <span className="fs-xs text-muted line-through">₹{item.price.toFixed(2)}</span>
                    )}
                  </div>
                  <span className="fs-sm fw-semibold text-accent flex-shrink-0">
                    ₹{(effectivePrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="border-t border-theme mt-4 pt-3 space-y-1">
            <div className="flex justify-between fs-xs text-muted">
              <span>Delivery</span><span className="text-green-400">Free (Standard)</span>
            </div>
            <div className="flex justify-between fs-sm fw-bold text-primary">
              <span>{dict.subtotal}</span>
              <span className="text-accent">₹{order.subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment + Delivery — side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-glass rounded-2xl p-5">
            <h3 className="fs-xs fw-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <CreditCard size={13} /> Payment
            </h3>
            <p className="fs-sm fw-semibold text-primary">
              {order.paymentMethod === 'Razorpay' ? 'Online Payment' : 'Cash on Delivery'}
            </p>
            <p className="fs-xs text-muted mt-0.5">
              {order.paymentMethod === 'Razorpay' ? 'Paid via Razorpay' : 'Pay when delivered'}
            </p>
            <span className={`order-status-badge order-status-badge--${order.paymentStatus} mt-2`}>
              {order.paymentStatus === 'paid' ? dict.payment_paid
                : order.paymentStatus === 'failed' ? 'Failed'
                : dict.payment_pending}
            </span>
          </div>

          <div className="card-glass rounded-2xl p-5">
            <h3 className="fs-xs fw-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Truck size={13} /> Delivery
            </h3>
            <p className="fs-sm fw-semibold text-primary">Standard Delivery</p>
            <p className="fs-xs text-muted mt-0.5">5–7 business days · Free</p>
          </div>
        </div>

        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="card-glass rounded-2xl p-5">
            <h3 className="fs-xs fw-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <MapPin size={13} /> {dict.shipping_to}
            </h3>
            <p className="fs-sm fw-semibold text-primary">{order.shippingAddress.fullName}</p>
            <p className="fs-sm text-secondary">{order.shippingAddress.phone}</p>
            <p className="fs-xs text-muted mt-1">
              {order.shippingAddress.street}, {order.shippingAddress.city},<br />
              {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
            </p>
          </div>
        )}

        {/* Complete payment */}
        {canRetryPayment && (
          <div className="card-glass rounded-2xl p-5" style={{ borderColor: 'rgba(234,179,8,0.3)' }}>
            <p className="fs-sm fw-semibold text-primary mb-1 flex items-center gap-1.5">
              <AlertCircle size={15} style={{ color: '#eab308' }} />
              Complete Your Payment
            </p>
            <p className="fs-xs text-muted mb-3">
              This order hasn&apos;t been paid for yet. Complete your payment to confirm it.
            </p>
            {retryError && (
              <p className="fs-xs mb-3" style={{ color: '#ef4444' }}>{retryError}</p>
            )}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={retrying || !razorpayReady}
              onClick={handleRetryPayment}
            >
              {retrying ? 'Processing…' : 'Complete Payment'}
            </button>
          </div>
        )}

        {/* Cancel request */}
        {canCancel && (
          <div className="card-glass rounded-2xl p-5 cancel-section">
            <p className="fs-sm fw-semibold text-primary mb-1">Cancel Order</p>
            <p className="fs-xs text-muted mb-3">
              You can cancel this order while it is still in the confirmed stage. Once shipped, cancellation is not available.
            </p>
            <button
              type="button"
              className="btn btn-cancel btn-sm"
              disabled={cancelling}
              onClick={() => setShowCancelModal(true)}
            >
              {cancelling ? dict.cancelling : dict.cancel_order}
            </button>
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
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
            onClick={() => setShowCancelModal(false)}
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
