'use client'

import { useEffect, useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { reviewService } from '@/src/services/review.service'
import { useAppSelector } from '@/src/store/hooks'
import { selectAuth } from '@/src/store/slices/authSlice'
import type { Review, ReviewUser } from '@/src/types/review'
import Textarea from '@/src/components/ui/Textarea/Textarea'
import Button from '@/src/components/ui/Button/Button'

interface Dict {
  heading: string
  no_reviews: string
  add_heading: string
  rating_label: string
  comment_label: string
  comment_placeholder: string
  submit: string
  loading: string
  already_reviewed: string
  login_required: string
  error_rating: string
  error_comment_min: string
  error_comment_max: string
}

interface Props {
  productId: string
  dict: Dict
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

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Rate ${n}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
        >
          <Star
            size={22}
            className={(hovered || value) >= n ? 'star-filled' : 'star-empty'}
            fill={(hovered || value) >= n ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({
  review,
  canDelete,
  onDelete,
}: {
  review: Review
  canDelete: boolean
  onDelete: () => void
}) {
  const user = typeof review.userId === 'string' ? null : review.userId as ReviewUser
  const name = user?.name ?? 'Customer'
  const date = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <div className="card-glass rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ReviewerAvatar user={review.userId} />
          <div>
            <p className="fs-sm fw-semibold text-primary">{name}</p>
            <p className="fs-xs text-muted">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={13}
                className={i < review.rating ? 'star-filled' : 'star-empty'}
                fill={i < review.rating ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          {canDelete && (
            <button
              type="button"
              className="navbar-icon-btn"
              aria-label="Delete review"
              onClick={onDelete}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <p className="fs-sm text-secondary leading-relaxed">{review.comment}</p>
    </div>
  )
}

export default function ReviewsSection({ productId, dict }: Props) {
  const { token, user } = useAppSelector(selectAuth)
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)

  const currentUserId = user?._id ?? user?.id

  useEffect(() => {
    reviewService.getReviews(productId)
      .then(({ reviews: r, averageRating }) => {
        setReviews(r)
        setAvgRating(averageRating)
        if (currentUserId) {
          setAlreadyReviewed(r.some((rv) => {
            if (!rv.userId) return false
            const uid = typeof rv.userId === 'string' ? rv.userId : rv.userId._id
            return uid === currentUserId
          }))
        }
      })
      .catch(console.error)
      .finally(() => setLoadingReviews(false))
  }, [productId, currentUserId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (rating < 1 || rating > 5) { setSubmitError(dict.error_rating); return }
    if (comment.trim().length < 10) { setSubmitError(dict.error_comment_min); return }
    if (comment.trim().length > 1000) { setSubmitError(dict.error_comment_max); return }

    setSubmitting(true)
    try {
      const newReview = await reviewService.addReview(productId, { rating, comment: comment.trim() })
      setReviews((prev) => [newReview, ...prev])
      setAvgRating((prev) =>
        prev === 0
          ? rating
          : parseFloat(((prev * reviews.length + rating) / (reviews.length + 1)).toFixed(1))
      )
      setRating(0)
      setComment('')
      setAlreadyReviewed(true)
    } catch (err) {
      const msg = (err as Error).message
      if (msg.includes('409') || msg.toLowerCase().includes('already')) {
        setAlreadyReviewed(true)
      } else {
        setSubmitError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (review: Review) => {
    try {
      await reviewService.deleteReview(productId, review._id)
      const updated = reviews.filter((r) => r._id !== review._id)
      setReviews(updated)
      const newAvg = updated.length
        ? parseFloat((updated.reduce((s, r) => s + r.rating, 0) / updated.length).toFixed(1))
        : 0
      setAvgRating(newAvg)
      const uid = !review.userId
        ? undefined
        : typeof review.userId === 'string'
          ? review.userId
          : review.userId._id
      if (uid && uid === currentUserId) setAlreadyReviewed(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <section className="pd-specs-section">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h2 className="text-h3 text-primary">{dict.heading}</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(avgRating) ? 'star-filled' : 'star-empty'}
                  fill={i < Math.round(avgRating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="fs-sm text-secondary">{avgRating.toFixed(1)} ({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Add review form */}
      {token && !alreadyReviewed && (
        <form onSubmit={handleSubmit} className="card-glass rounded-xl p-5 mb-8 flex flex-col gap-4">
          <h3 className="text-h4 text-primary">{dict.add_heading}</h3>
          <div className="flex flex-col gap-1">
            <label className="fs-sm fw-medium text-secondary">{dict.rating_label}</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <Textarea
            label={dict.comment_label}
            rows={4}
            placeholder={dict.comment_placeholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            error={submitError ?? undefined}
          />
          <Button variant="primary" size="sm" type="submit" disabled={submitting}>
            {submitting ? dict.loading : dict.submit}
          </Button>
        </form>
      )}

      {token && alreadyReviewed && (
        <p className="fs-sm text-muted mb-6">{dict.already_reviewed}</p>
      )}

      {!token && (
        <p className="fs-sm text-muted mb-6">{dict.login_required}</p>
      )}

      {loadingReviews ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-glass rounded-xl p-4 h-20 animate-pulse bg-secondary" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-body-sm text-muted">{dict.no_reviews}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => {
            const uid = !review.userId
              ? undefined
              : typeof review.userId === 'string'
                ? review.userId
                : review.userId._id
            const canDelete = !!uid && uid === currentUserId
            return (
              <ReviewCard
                key={review._id}
                review={review}
                canDelete={canDelete}
                onDelete={() => handleDelete(review)}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
