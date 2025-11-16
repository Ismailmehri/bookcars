import * as bookcarsTypes from ':bookcars-types'

export type SupplierWithReviews = bookcarsTypes.User & {
  reviewAuthors?: bookcarsTypes.ReviewAuthor[]
}

export interface SupplierReviewRecord extends bookcarsTypes.Review {
  reviewerFullName?: string
  reviewerEmail?: string
  reviewerAvatar?: string
  reviewerType?: string
}

export interface SupplierReviewsResponse {
  resultData?: SupplierReviewRecord[]
  pageInfo?: Array<{ totalRecords?: number }>
}

export interface SupplierReviewPreview {
  review: bookcarsTypes.Review
  authorName: string
  fullAuthorName: string
}

export interface BuildSupplierLinkMessageOptions {
  supplierName: string
  dailyPriceLabel?: string
  dailySuffix?: string
}

export const getSupplierProfilePath = (slug?: string): string => (
  slug ? `/search/agence/${slug}` : '/search/agence'
)

export const buildSupplierLinkMessage = ({
  supplierName,
  dailyPriceLabel,
  dailySuffix,
}: BuildSupplierLinkMessageOptions): string => {
  const trimmedName = supplierName.trim()
  const baseLabel = `Louer une voiture chez ${trimmedName || 'cette agence'}`

  if (!dailyPriceLabel) {
    return baseLabel
  }

  const priceLabel = dailySuffix ? `${dailyPriceLabel}${dailySuffix}` : dailyPriceLabel
  return `${baseLabel} à partir de ${priceLabel}`
}

const parseDate = (value?: Date | string): number => {
  if (!value) {
    return 0
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? 0 : value.getTime()
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

export const abbreviateName = (name?: string): string => {
  if (!name) {
    return 'Client Plany'
  }

  const trimmed = name.trim()
  if (!trimmed) {
    return 'Client Plany'
  }

  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) {
    return parts[0]
  }

  const [first, second] = parts
  const initial = second ? `${second.charAt(0).toUpperCase()}.` : ''
  return `${first} ${initial}`.trim()
}

export const isSupplierValidated = (supplier: SupplierWithReviews): boolean => (
  Boolean(supplier.agencyVerified ?? supplier.verified)
)

export const getReviewCount = (supplier: SupplierWithReviews): number => {
  if (typeof supplier.reviewCount === 'number' && Number.isFinite(supplier.reviewCount)) {
    return Math.max(0, supplier.reviewCount)
  }

  if (Array.isArray(supplier.reviews)) {
    return supplier.reviews.length
  }

  return 0
}

export const getReservationCount = (supplier: SupplierWithReviews): number => {
  if (typeof supplier.reservationCount === 'number' && Number.isFinite(supplier.reservationCount)) {
    return Math.max(0, supplier.reservationCount)
  }

  const { reservations } = supplier as SupplierWithReviews & { reservations?: number }

  if (typeof reservations === 'number' && Number.isFinite(reservations)) {
    return Math.max(0, reservations)
  }

  return 0
}

const getAuthorFullName = (supplier: SupplierWithReviews, review: bookcarsTypes.Review): string => {
  const author = supplier.reviewAuthors?.find((candidate) => candidate._id === review.user)
  if (author?.fullName) {
    return author.fullName
  }

  if (review.type === 'plany') {
    return 'Plany.tn'
  }

  return 'Client Plany'
}

export const getReviewAuthorName = (
  supplier: SupplierWithReviews,
  review: bookcarsTypes.Review,
): string => getAuthorFullName(supplier, review)

export const resolveReviewAuthorNames = (
  supplier: SupplierWithReviews | null,
  review: SupplierReviewRecord,
): { fullName: string; abbreviated: string } => {
  const fullNameFromReview = review.reviewerFullName?.trim()

  const fullName = fullNameFromReview && fullNameFromReview.length > 0
    ? fullNameFromReview
    : supplier
      ? getAuthorFullName(supplier, review)
      : 'Client Plany'

  return {
    fullName,
    abbreviated: abbreviateName(fullName),
  }
}

export const getSortedReviews = (
  supplier: SupplierWithReviews,
): bookcarsTypes.Review[] => {
  const reviews = Array.isArray(supplier.reviews) ? supplier.reviews.slice() : []

  return reviews.sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt))
}

export const getRecentReviews = (
  supplier: SupplierWithReviews,
  limit = 2,
): SupplierReviewPreview[] => getSortedReviews(supplier)
  .slice(0, limit)
  .map((review) => {
    const fullAuthorName = getAuthorFullName(supplier, review)
    return {
      review,
      fullAuthorName,
      authorName: abbreviateName(fullAuthorName),
    }
  })

export const sortSuppliers = (a: SupplierWithReviews, b: SupplierWithReviews): number => {
  const validatedA = isSupplierValidated(a)
  const validatedB = isSupplierValidated(b)

  if (validatedA !== validatedB) {
    return validatedA ? -1 : 1
  }

  const carCountA = a.carCount ?? 0
  const carCountB = b.carCount ?? 0

  if (carCountA !== carCountB) {
    return carCountB - carCountA
  }

  return (a.fullName || '').localeCompare(b.fullName || '', 'fr', { sensitivity: 'base' })
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.substring(0, maxLength - 1).trimEnd()}…`
}

const normalizeRatingToFiveScale = (value?: number | string | null): number | null => {
  if (value === null || value === undefined) {
    return null
  }

  const numeric = typeof value === 'string' ? Number(value) : value

  if (!Number.isFinite(numeric)) {
    return null
  }

  const safeValue = Math.max(numeric as number, 0)
  const normalized = safeValue > 5 ? safeValue / 20 : safeValue
  const clamped = Math.min(Math.max(normalized, 0), 5)

  return Math.round(clamped * 10) / 10
}

const buildReviewAuthor = (
  fullAuthorName: string,
  reviewType?: string,
): { '@type': 'Person' | 'Organization'; name: string } => {
  const trimmedName = fullAuthorName?.trim()
  const fallbackName = reviewType === 'plany' ? 'Plany.tn' : 'Client Plany'
  const resolvedName = trimmedName && trimmedName.length > 0 ? trimmedName : fallbackName

  if (reviewType === 'plany') {
    return {
      '@type': 'Organization',
      name: resolvedName,
    }
  }

  return {
    '@type': 'Person',
    name: resolvedName,
  }
}

export const buildSupplierStructuredData = (
  supplier: SupplierWithReviews,
): Record<string, unknown> => {
  const reviewCount = supplier.reviewCount ?? (Array.isArray(supplier.reviews) ? supplier.reviews.length : 0)
  const numericScore = typeof supplier.score === 'number' ? supplier.score : Number(supplier.score ?? 0)
  const normalizedScore = normalizeRatingToFiveScale(numericScore)
  const url = supplier.slug ? `https://plany.tn/search/agence/${supplier.slug}` : undefined
  const reviews = getRecentReviews(supplier)

  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: supplier.fullName,
  }

  if (url) {
    structuredData.url = url
  }

  if (reviewCount > 0 && normalizedScore !== null) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: normalizedScore,
      reviewCount,
      bestRating: 5,
      worstRating: 0,
    }
  }

  if (reviews.length > 0) {
    structuredData.review = reviews.map((preview) => {
      const normalizedReviewRating = normalizeRatingToFiveScale(preview.review.rating as number | string | null)
      const reviewData: Record<string, unknown> = {
        '@type': 'Review',
        author: buildReviewAuthor(preview.fullAuthorName, preview.review.type),
        datePublished: new Date(parseDate(preview.review.createdAt) || Date.now()).toISOString(),
      }

      if (preview.review.comments) {
        reviewData.reviewBody = preview.review.comments
      }

      if (normalizedReviewRating !== null) {
        reviewData.reviewRating = {
          '@type': 'Rating',
          ratingValue: normalizedReviewRating,
          bestRating: 5,
          worstRating: 0,
        }
      }

      return reviewData
    })
  }

  return structuredData
}
