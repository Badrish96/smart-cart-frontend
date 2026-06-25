'use client'

import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { selectAuth } from '@/src/store/slices/authSlice'
import {
  selectIsInWishlist,
  selectIsWishlistPending,
  addToWishlistThunk,
  removeFromWishlistThunk,
} from '@/src/store/slices/wishlistSlice'
import { ROUTES } from '@/src/routes'

interface WishlistButtonProps {
  productId: string
  lang: string
  className?: string
  size?: number
}

export default function WishlistButton({
  productId,
  lang,
  className = '',
  size = 16,
}: WishlistButtonProps) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { token } = useAppSelector(selectAuth)
  const isInWishlist = useAppSelector(selectIsInWishlist(productId))
  const isPending = useAppSelector(selectIsWishlistPending(productId))

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!token) {
      router.push(ROUTES.login(lang))
      return
    }

    if (isPending) return

    if (isInWishlist) {
      dispatch(removeFromWishlistThunk(productId))
    } else {
      dispatch(addToWishlistThunk(productId))
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      className={['wishlist-btn', isInWishlist ? 'wishlist-btn--active' : '', isPending ? 'wishlist-btn--pending' : '', className].filter(Boolean).join(' ')}
    >
      <Heart
        size={size}
        fill={isInWishlist ? 'currentColor' : 'none'}
        strokeWidth={isInWishlist ? 0 : 1.8}
      />
    </button>
  )
}
