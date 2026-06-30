'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Check, ShoppingCart, CreditCard, Truck, Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { selectCart, clearCartThunk } from '@/src/store/slices/cartSlice'
import { selectAuth } from '@/src/store/slices/authSlice'
import { orderService } from '@/src/services/order.service'
import { cartItemTotal, cartItemProduct } from '@/src/services/cart.service'
import { getImageUrl } from '@/src/types/product'
import { useRazorpayScript } from '@/src/hooks/useRazorpayScript'
import type { Address } from '@/src/types/auth'
import type { PaymentMethod, ShippingAddress } from '@/src/types/order'
import { ROUTES } from '@/src/routes'

const EMPTY_NEW_ADDR: ShippingAddress = {
  fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India',
}

interface Dict {
  heading: string
  order_summary: string
  shipping_address: string
  no_addresses: string
  go_to_profile: string
  place_order: string
  placing: string
  pay_now: string
  paying: string
  subtotal: string
  total: string
  payment_method: string
  payment_cod: string
  payment_cod_desc: string
  payment_online: string
  payment_online_desc: string
  payment_cancelled: string
  payment_verify_failed: string
}

interface Props { lang: string; dict: Dict }

export default function CheckoutClient({ lang, dict }: Props) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const cart = useAppSelector(selectCart)
  const { user } = useAppSelector(selectAuth)
  const razorpayReady = useRazorpayScript()

  const addresses: Address[] = user?.addresses ?? []
  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null

  const [selectedAddrId, setSelectedAddrId] = useState<string>(defaultAddr?._id ?? 'new')
  const [newAddr, setNewAddr] = useState<ShippingAddress>(EMPTY_NEW_ADDR)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState(false)  // prevents empty-cart flash after order
  const [error, setError] = useState<string | null>(null)

  // Prevent showing empty state after order was just placed
  if (!placed && (!cart || cart.items.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <ShoppingCart size={64} className="text-muted" />
        <p className="text-h4 text-primary">Your cart is empty.</p>
        <Link href={ROUTES.products(lang)} className="btn btn-primary mt-2">Browse Products</Link>
      </div>
    )
  }

  const subtotal = cart?.items.reduce((sum, item) => sum + cartItemTotal(item), 0) ?? 0

  const getShippingAddress = (): ShippingAddress | undefined => {
    if (selectedAddrId === 'new') {
      const { fullName, phone, street, city, state, zipCode, country } = newAddr
      if (!fullName || !phone || !street || !city || !state || !zipCode || !country) return undefined
      return newAddr
    }
    const addr = addresses.find((a) => a._id === selectedAddrId)
    if (!addr) return undefined
    return {
      fullName: addr.fullName, phone: addr.phone, street: addr.street,
      city: addr.city, state: addr.state, zipCode: addr.zipCode,
      country: addr.country, label: addr.label,
    }
  }

  const handlePlaceOrder = async () => {
    setError(null)
    const shippingAddress = getShippingAddress()
    if (!shippingAddress) {
      setError('Please fill in all shipping address fields.')
      return
    }

    if (paymentMethod === 'Razorpay' && !razorpayReady) {
      setError('Payment gateway is still loading. Please try again in a moment.')
      return
    }

    setPlacing(true)
    try {
      const { order, razorpay } = await orderService.checkout(shippingAddress, paymentMethod)

      if (paymentMethod === 'COD' || !razorpay) {
        setPlaced(true)                       // block empty-state flash
        dispatch(clearCartThunk())            // clear cart in background
        router.push(ROUTES.orderDetail(lang, order._id))
        return
      }

      // Razorpay flow — open the checkout widget, then verify the payment server-side
      const rzp = new window.Razorpay({
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        order_id: razorpay.orderId,
        name: 'SmartCart',
        description: `Order #${order._id.slice(-8).toUpperCase()}`,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            await orderService.verifyPayment(order._id, response)
            setPlaced(true)
            dispatch(clearCartThunk())
            router.push(ROUTES.orderDetail(lang, order._id))
          } catch {
            setError(dict.payment_verify_failed)
            setPlacing(false)
            router.push(ROUTES.orderDetail(lang, order._id))
          }
        },
        modal: {
          ondismiss: () => {
            setError(dict.payment_cancelled)
            setPlacing(false)
          },
        },
      })
      rzp.open()
    } catch (err) {
      setError((err as Error).message)
      setPlacing(false)
    }
  }

  const setField = (key: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewAddr((f) => ({ ...f, [key]: e.target.value }))

  return (
    <div className="max-w-4xl mx-auto px-6 max-sm:px-4 mt-24 pb-16">
      <h1 className="text-h2 text-primary mb-8">{dict.heading}</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left column ── */}
        <div className="flex-1 flex flex-col gap-5">

          {/* Shipping address */}
          <section className="card-glass rounded-2xl p-6">
            <h2 className="text-h4 text-primary mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-accent" />
              {dict.shipping_address}
            </h2>

            <div className="flex flex-col gap-3">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={[
                    'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
                    selectedAddrId === addr._id ? 'border-accent' : 'border-theme',
                  ].join(' ')}
                >
                  <input
                    type="radio" name="address" value={addr._id}
                    checked={selectedAddrId === addr._id}
                    onChange={() => setSelectedAddrId(addr._id)}
                    className="mt-1 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="fs-sm fw-semibold text-primary">{addr.label || 'Address'}</span>
                      {addr.isDefault && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full fs-xs fw-semibold text-white bg-accent">
                          <Check size={9} /> Default
                        </span>
                      )}
                    </div>
                    <p className="fs-sm text-secondary">{addr.fullName} · {addr.phone}</p>
                    <p className="fs-xs text-muted">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                  </div>
                </label>
              ))}

              {/* "Add a different address" option */}
              <label className={[
                'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
                selectedAddrId === 'new' ? 'border-accent' : 'border-theme',
              ].join(' ')}>
                <input
                  type="radio" name="address" value="new"
                  checked={selectedAddrId === 'new'}
                  onChange={() => setSelectedAddrId('new')}
                  className="mt-1 flex-shrink-0"
                />
                <div className="flex items-center gap-2">
                  <Plus size={15} className="text-accent flex-shrink-0" />
                  <span className="fs-sm fw-medium text-primary">Use a different address</span>
                </div>
              </label>

              {/* Inline form for new address */}
              {selectedAddrId === 'new' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                  {(
                    [
                      ['fullName', 'Full Name', true],
                      ['phone', 'Phone', true],
                      ['street', 'Street', true],
                      ['city', 'City', true],
                      ['state', 'State', true],
                      ['zipCode', 'ZIP Code', true],
                      ['country', 'Country', true],
                    ] as [keyof ShippingAddress, string, boolean][]
                  ).map(([key, label]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="fs-xs fw-medium text-muted">{label}</label>
                      <input
                        className="input-base"
                        value={newAddr[key] as string}
                        onChange={setField(key)}
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
              )}

              {addresses.length === 0 && selectedAddrId !== 'new' && (
                <p className="fs-xs text-muted">{dict.no_addresses}</p>
              )}
            </div>
          </section>

          {/* Payment method */}
          <section className="card-glass rounded-2xl p-6">
            <h2 className="text-h4 text-primary mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-accent" />
              {dict.payment_method}
            </h2>
            <div className="flex flex-col gap-3">
              <label
                className={[
                  'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
                  paymentMethod === 'COD' ? 'border-accent' : 'border-theme',
                ].join(' ')}
              >
                <input
                  type="radio" name="paymentMethod" value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="flex-shrink-0"
                />
                <div>
                  <p className="fs-sm fw-semibold text-primary">{dict.payment_cod}</p>
                  <p className="fs-xs text-muted">{dict.payment_cod_desc}</p>
                </div>
              </label>

              <label
                className={[
                  'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
                  paymentMethod === 'Razorpay' ? 'border-accent' : 'border-theme',
                ].join(' ')}
              >
                <input
                  type="radio" name="paymentMethod" value="Razorpay"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                  className="flex-shrink-0"
                />
                <div>
                  <p className="fs-sm fw-semibold text-primary">{dict.payment_online}</p>
                  <p className="fs-xs text-muted">{dict.payment_online_desc}</p>
                </div>
              </label>
            </div>
          </section>

          {/* Shipping method */}
          <section className="card-glass rounded-2xl p-6">
            <h2 className="text-h4 text-primary mb-4 flex items-center gap-2">
              <Truck size={18} className="text-accent" />
              Delivery Method
            </h2>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 p-4 rounded-xl border-accent border cursor-pointer">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: 'var(--color-accent-primary)' }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                </div>
                <div className="flex-1">
                  <p className="fs-sm fw-semibold text-primary">Standard Delivery</p>
                  <p className="fs-xs text-muted">5–7 business days · Free</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl border-theme cursor-pointer opacity-60">
                <div className="w-5 h-5 rounded-full border-2 border-theme flex-shrink-0" />
                <div className="flex-1">
                  <p className="fs-sm fw-semibold text-primary">Priority Delivery</p>
                  <p className="fs-xs text-muted">1–3 business days · Coming soon</p>
                </div>
              </label>
            </div>
          </section>

          {error && (
            <p className="fs-sm rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
              {error}
            </p>
          )}
        </div>

        {/* ── Right: order summary ── */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="card-glass rounded-2xl p-6 flex flex-col gap-4 lg:sticky lg:top-24">
            <h2 className="text-h4 text-primary">{dict.order_summary}</h2>

            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
              {cart?.items.map((item, idx) => {
                const product = cartItemProduct(item)
                const imgUrl = product?.images?.[0] ? getImageUrl(product.images[0]) : null
                return (
                  <div key={item._id ?? idx} className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {imgUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imgUrl} alt={product?.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="fs-xs text-muted">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="fs-xs fw-medium text-primary truncate">{product?.name ?? 'Product'}</p>
                      <p className="fs-xs text-muted">×{item.quantity}</p>
                    </div>
                    <span className="fs-xs fw-semibold text-accent flex-shrink-0">
                      ₹{cartItemTotal(item).toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-theme pt-3 space-y-1">
              <div className="flex justify-between fs-xs text-muted">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between fs-xs text-muted">
                <span>Delivery</span><span className="text-green-400">Free</span>
              </div>
              <div className="flex justify-between fs-sm fw-bold text-primary pt-1 border-t border-theme">
                <span>{dict.total}</span>
                <span className="text-accent">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary w-full"
              disabled={placing || (paymentMethod === 'Razorpay' && !razorpayReady)}
              onClick={handlePlaceOrder}
            >
              {placing
                ? (paymentMethod === 'Razorpay' ? dict.paying : dict.placing)
                : (paymentMethod === 'Razorpay' ? dict.pay_now : dict.place_order)}
            </button>

            <p className="fs-xs text-muted text-center">
              {paymentMethod === 'Razorpay' ? dict.payment_online : dict.payment_cod}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
