'use client'

import { ShoppingCart, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { selectAuth } from '@/src/store/slices/authSlice'
import { addToCartThunk, selectIsCartPending } from '@/src/store/slices/cartSlice'
import { ROUTES } from '@/src/routes'

interface AddToCartButtonProps {
  productId: string
  lang: string
  label?: string
  /** Visual variant — 'icon' renders just the cart icon (for product cards) */
  variant?: 'icon' | 'full'
  className?: string
  disabled?: boolean
  quantity?: number
}

export default function AddToCartButton({
  productId,
  lang,
  label = 'Add to cart',
  variant = 'full',
  className = '',
  disabled = false,
  quantity = 1,
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { token } = useAppSelector(selectAuth)
  const isPending = useAppSelector(selectIsCartPending(productId))
  const [added, setAdded] = useState(false)


  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!token) {
      router.push(ROUTES.login(lang))
      return
    }

    if (isPending || disabled) return

    const result = await dispatch(addToCartThunk({ productId, quantity }))
    if (addToCartThunk.fulfilled.match(result)) {
      setAdded(true)
      setTimeout(() => setAdded(false), 1500)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || disabled}
        aria-label={label}
        title={label}
        className={[
          'product-cart-btn',
          isPending ? 'opacity-50 cursor-not-allowed' : '',
          className,
        ].filter(Boolean).join(' ')}
      >
        {added ? <Check size={14} /> : <ShoppingCart size={14} />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || disabled}
      className={['btn btn-primary', isPending ? 'opacity-70' : '', className].filter(Boolean).join(' ')}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <ShoppingCart size={18} />
          Adding…
        </span>
      ) : added ? (
        <span className="flex items-center gap-2">
          <Check size={18} />
          Added!
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <ShoppingCart size={18} />
          {label}
        </span>
      )}
    </button>
  )
}
