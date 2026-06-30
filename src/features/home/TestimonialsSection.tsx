'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { productService } from '@/src/services/product.service'
import { reviewService } from '@/src/services/review.service'
import type { Review, ReviewUser } from '@/src/types/review'

interface TestimonialsSectionProps {
  dict: {
    heading: string
    heading_accent: string
    subheading: string
    empty: string
  }
}

interface DisplayReview extends Review {
  productName: string
}

function ReviewerAvatar({ user }: { user: ReviewUser | string | null }) {
  const name = typeof user === 'string' || !user ? 'Customer' : user.name
  const pic = typeof user === 'string' || !user ? undefined : user.profilePicture?.url

  return (
    <div className="reviewer-avatar">
      {pic ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pic} alt={name} />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'star-filled' : 'star-empty'}
          fill={i < rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

export default function TestimonialsSection({ dict }: TestimonialsSectionProps) {
  const [reviews, setReviews] = useState<DisplayReview[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { products } = await productService.getProducts({ page: 1 })
        const candidates = products.slice(0, 8)

        const results = await Promise.allSettled(
          candidates.map(async (product) => {
            const { reviews: r } = await reviewService.getReviews(product._id)
            return r.map((rv): DisplayReview => ({ ...rv, productName: product.name }))
          })
        )

        const all: DisplayReview[] = results.flatMap((r) =>
          r.status === 'fulfilled' ? r.value : []
        )

        if (!cancelled) setReviews(all)
      } catch {
        // section stays empty silently
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const visible = showAll ? reviews : reviews.slice(0, 3)

  return (
    <section className="py-20 bg-secondary">
      <div className="max-w-[1280px] mx-auto px-6 max-sm:px-4">
        <div className="text-center mb-10">
          <h2 className="section-heading mb-3">
            {dict.heading} <span className="text-accent">{dict.heading_accent}</span>
          </h2>
          <p className="section-subheading mx-auto">{dict.subheading}</p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="testimonial-card animate-pulse">
                <div className="h-4 bg-secondary rounded w-1/2 mb-3" />
                <div className="h-3 bg-secondary rounded w-full mb-2" />
                <div className="h-3 bg-secondary rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <p className="text-center text-body-sm text-muted">{dict.empty}</p>
        )}

        {!loading && reviews.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((review) => {
                const user = typeof review.userId === 'string' ? null : review.userId as ReviewUser
                const name = user?.name ?? 'Customer'
                return (
                  <div key={review._id} className="testimonial-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <ReviewerAvatar user={review.userId} />
                        <div>
                          <p className="fs-sm fw-semibold text-primary">{name}</p>
                          <p className="fs-xs text-muted">{review.productName}</p>
                        </div>
                      </div>
                    </div>
                    <Stars rating={review.rating} />
                    <p className="fs-sm text-secondary leading-relaxed mt-3">{review.comment}</p>
                  </div>
                )
              })}
            </div>

            {reviews.length > 3 && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAll((v) => !v)}
                >
                  {showAll ? 'Show Less' : 'View More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
