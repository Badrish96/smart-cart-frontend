import httpClient from './httpClient'
import type { ReviewsResponse, AddReviewPayload, Review } from '@/src/types/review'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api/v1'

interface BackendReviewsEnvelope {
  success: boolean
  data: {
    reviews?: Review[]
    averageRating?: number
    totalReviews?: number
  } | Review[]
}

interface BackendReviewEnvelope {
  success: boolean
  data: { review?: Review } | Review
}

function extractReviews(raw: BackendReviewsEnvelope): ReviewsResponse {
  const d = raw.data
  if (Array.isArray(d)) {
    return { reviews: d, averageRating: 0, totalReviews: d.length }
  }
  return {
    reviews: (d as { reviews?: Review[] }).reviews ?? [],
    averageRating: (d as { averageRating?: number }).averageRating ?? 0,
    totalReviews: (d as { totalReviews?: number }).totalReviews ?? 0,
  }
}

export const reviewService = {
  async getReviews(productId: string): Promise<ReviewsResponse> {
    const { data } = await httpClient.get<BackendReviewsEnvelope>(
      `${API_BASE}/products/${productId}/reviews`
    )
    return extractReviews(data)
  },

  async addReview(productId: string, payload: AddReviewPayload): Promise<Review> {
    const { data } = await httpClient.post<BackendReviewEnvelope>(
      `${API_BASE}/products/${productId}/reviews`,
      payload
    )
    const d = data.data
    if ('review' in d && d.review) return d.review
    return d as unknown as Review
  },

  async deleteReview(productId: string, reviewId: string): Promise<void> {
    await httpClient.delete(`${API_BASE}/products/${productId}/reviews/${reviewId}`)
  },
}
