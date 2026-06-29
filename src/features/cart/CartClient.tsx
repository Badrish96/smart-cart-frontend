'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Trash2, Headphones } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import {
  fetchCartThunk, updateCartItemThunk, removeCartItemThunk,
  selectCart, selectCartLoading,
} from '@/src/store/slices/cartSlice'
import { cartItemProduct, cartItemEffectivePrice, cartItemTotal } from '@/src/services/cart.service'
import { getImageUrl } from '@/src/types/product'
import { ROUTES } from '@/src/routes'

interface Dict {
  heading: string
  empty: string
  empty_sub: string
  browse: string
  remove: string
  quantity: string
  subtotal: string
  checkout: string
  continue_shopping: string
}

interface Props { lang: string; dict: Dict }

export default function CartClient({ lang, dict }: Props) {
  const dispatch = useAppDispatch()
  const cart = useAppSelector(selectCart)
  const isLoading = useAppSelector(selectCartLoading)

  useEffect(() => { dispatch(fetchCartThunk()) }, [dispatch])

  if (isLoading && !cart) {
    return (
      <div className="max-w-4xl mx-auto px-6 mt-24 pb-10">
        <div className="flex flex-col gap-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-glass rounded-2xl p-5 flex gap-4 h-28">
              <div className="w-20 h-20 rounded-xl bg-secondary flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1 justify-center">
                <div className="h-4 rounded bg-secondary w-2/3" />
                <div className="h-3 rounded bg-secondary w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <ShoppingCart size={64} className="text-muted" />
        <p className="text-h4 text-primary">{dict.empty}</p>
        <p className="text-body-sm text-secondary">{dict.empty_sub}</p>
        <Link href={ROUTES.products(lang)} className="btn btn-primary mt-2">{dict.browse}</Link>
      </div>
    )
  }

  const subtotal = cart.items.reduce((sum, item) => sum + cartItemTotal(item), 0)

  return (
    <div className="max-w-4xl mx-auto px-6 max-sm:px-4 mt-24 pb-16">
      <h1 className="text-h2 text-primary mb-8">{dict.heading}</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items list */}
        <div className="flex flex-col gap-4 flex-1">
          {cart.items.map((item) => {
            const product = cartItemProduct(item)
            const imgUrl = product?.images?.[0] ? getImageUrl(product.images[0]) : null
            const effectivePrice = cartItemEffectivePrice(item)
            const lineTotal = cartItemTotal(item)

            return (
              <div key={item._id} className="card-glass rounded-2xl p-4 flex gap-4 items-start">
                {/* Thumbnail */}
                <Link href={product ? ROUTES.productDetail(lang, product._id) : '#'} className="link-plain flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                    {imgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgUrl} alt={product?.name ?? 'Product'} className="w-full h-full object-contain p-2" />
                    ) : (
                      <Headphones size={28} className="text-muted" />
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={product ? ROUTES.productDetail(lang, product._id) : '#'} className="link-plain">
                    <p className="fs-sm fw-semibold text-primary truncate">{product?.name ?? 'Product'}</p>
                  </Link>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="fs-sm fw-bold text-accent">₹{effectivePrice.toFixed(2)}</span>
                    {!!item.discount && item.discount > 0 && (
                      <span className="fs-xs text-muted line-through">₹{item.price.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Qty + remove row */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="qty-control">
                      <button
                        type="button"
                        aria-label="Decrease"
                        disabled={item.quantity <= 1}
                        onClick={() => dispatch(updateCartItemThunk({ itemId: item._id, quantity: item.quantity - 1 }))}
                      >−</button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase"
                        onClick={() => dispatch(updateCartItemThunk({ itemId: item._id, quantity: item.quantity + 1 }))}
                      >+</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="fs-sm fw-semibold text-primary">₹{lineTotal.toFixed(2)}</span>
                      <button
                        type="button"
                        className="navbar-icon-btn"
                        aria-label={dict.remove}
                        onClick={() => dispatch(removeCartItemThunk(item._id))}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order summary sticky panel */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="card-glass rounded-2xl p-6 flex flex-col gap-4 lg:sticky lg:top-24">
            <h2 className="text-h4 text-primary">{dict.subtotal}</h2>
            <div className="flex justify-between items-center border-b border-theme pb-3">
              <span className="fs-sm text-secondary">
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
              </span>
              <span className="fs-lg fw-bold text-accent">₹{subtotal.toFixed(2)}</span>
            </div>
            <Link href={ROUTES.checkout(lang)} className="btn btn-primary w-full text-center">
              {dict.checkout}
            </Link>
            <Link href={ROUTES.products(lang)} className="btn btn-ghost btn-sm w-full text-center">
              {dict.continue_shopping}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
