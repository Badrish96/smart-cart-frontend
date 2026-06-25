import type { ProfilePicture } from './auth'

export interface ReviewUser {
  _id: string
  name: string
  email?: string
  profilePicture?: ProfilePicture
}

export interface Review {
  _id: string
  productId: string
  userId: ReviewUser | string
  rating: number
  comment: string
  createdAt: string
  updatedAt?: string
}

export interface ReviewsResponse {
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

export interface AddReviewPayload {
  rating: number
  comment: string
}
