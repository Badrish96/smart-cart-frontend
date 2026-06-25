'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Heart, Trash2, ShoppingCart, Headphones } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { fetchWishlistThunk, removeFromWishlistThunk, selectWishlist } from '@/src/store/slices/wishlistSlice'
import { getImageUrl } from '@/src/types/product'
import { ROUTES } from '@/src/routes'

interface Props {
  lang: string
  dict: {
    heading: string
    empty: string
    empty_sub: string
    browse: string
    remove: string
    add_to_cart: string
  }
}

export default function WishlistClient({ lang, dict }: Props) {
  const dispatch = useAppDispatch()
  const { products, pendingIds } = useAppSelector(selectWishlist)

  useEffect(() => {
    dispatch(fetchWishlistThunk())
  }, [dispatch])

  // Show loading skeleton only on initial load (products empty + pending fetch)
  const isInitialLoad = products.length === 0 && pendingIds.length === 0

  if (isInitialLoad) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Heart size={48} className="text-accent animate-pulse" />
          <p className="text-body text-secondary">Loading wishlist…</p>
        </div>
      </div>
    )
  }

  // Filter out optimistic placeholders (name === '') for the UI
  const displayProducts = products.filter((p) => p.name !== '')

  if (displayProducts.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <Heart size={64} className="text-muted" />
        <p className="text-h4 text-primary">{dict.empty}</p>
        <p className="text-body-sm text-secondary">{dict.empty_sub}</p>
        <Link href={ROUTES.products(lang)} className="btn btn-primary mt-2">
          {dict.browse}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4 mt-20 mb-5">
      <h1 className="text-h2 text-primary mb-8">{dict.heading}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {displayProducts.map((product) => {
          const imageUrl = product.images?.[0] ? getImageUrl(product.images[0]) : null
          const discountedPrice = product.discount
            ? product.price * (1 - product.discount / 100)
            : null
          const isPending = pendingIds.includes(product._id)

          return (
            <div key={product._id} className="card-glass rounded-2xl overflow-hidden flex flex-col">
              <Link href={ROUTES.productDetail(lang, product._id)} className="block product-img-canvas bg-secondary">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={product.name} className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Headphones size={48} className="text-muted" />
                  </div>
                )}
              </Link>

              <div className="p-4 flex flex-col gap-3 flex-1">
                <Link href={ROUTES.productDetail(lang, product._id)} className="link-plain">
                  <p className="text-body fw-semibold text-primary line-clamp-2">{product.name}</p>
                </Link>

                <div className="flex items-baseline gap-2">
                  {discountedPrice ? (
                    <>
                      <span className="fs-lg fw-bold text-accent">₹{discountedPrice.toFixed(2)}</span>
                      <span className="fs-sm text-muted line-through">₹{product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="fs-lg fw-bold text-accent">₹{product.price.toFixed(2)}</span>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm flex-1"
                    disabled={(product.stock ?? 1) === 0}
                  >
                    <ShoppingCart size={14} />
                    {dict.add_to_cart}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    aria-label={dict.remove}
                    title={dict.remove}
                    disabled={isPending}
                    onClick={() => dispatch(removeFromWishlistThunk(product._id))}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
