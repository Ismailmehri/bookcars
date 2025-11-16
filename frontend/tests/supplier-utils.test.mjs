import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const commonDist = path.join(distRoot, 'common')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(commonDist, relativePath)))

const supplierModule = await loadModule('supplier.js')
const {
  sortSuppliers,
  getRecentReviews,
  buildSupplierStructuredData,
  abbreviateName,
  truncateText,
  getReviewCount,
  getSortedReviews,
  getReviewAuthorName,
  resolveReviewAuthorNames,
  getReservationCount,
} = supplierModule

const createReview = ({
  _id,
  booking = 'booking-1',
  user,
  type = 'agency',
  rating = 4.5,
  comments = 'Service impeccable et ponctuel.',
  rentedCar = true,
  answeredCall = true,
  canceledLastMinute = false,
  createdAt = '2024-01-01T10:00:00.000Z',
}) => ({
  _id,
  booking,
  user,
  type,
  rating,
  comments,
  rentedCar,
  answeredCall,
  canceledLastMinute,
  createdAt,
})

const createSupplier = (overrides = {}) => ({
  _id: 'supplier-base',
  fullName: 'Agence Test',
  slug: 'agence-test',
  agencyVerified: true,
  verified: true,
  active: true,
  carCount: 6,
  reviewCount: 3,
  score: 4.4,
  reviews: [
    createReview({ _id: 'r1', user: 'u1', createdAt: '2024-01-01T10:00:00.000Z' }),
    createReview({ _id: 'r2', user: 'u2', createdAt: '2024-02-01T12:00:00.000Z' }),
    createReview({ _id: 'r3', user: 'u3', type: 'plany', createdAt: '2024-03-01T09:30:00.000Z' }),
  ],
  reviewAuthors: [
    { _id: 'u1', fullName: 'Le Locataire' },
    { _id: 'u2', fullName: 'Agence Premium' },
  ],
  reservationCount: 18,
  ...overrides,
})

test('sortSuppliers place les agences validées avant les non validées et trie par nombre de voitures', () => {
  const suppliers = [
    createSupplier({ _id: '1', fullName: 'Agence Beta', agencyVerified: false, carCount: 12 }),
    createSupplier({ _id: '2', fullName: 'Agence Alpha', agencyVerified: true, carCount: 4 }),
    createSupplier({ _id: '3', fullName: 'Agence Zeta', agencyVerified: true, carCount: 9 }),
  ]

  const ordered = suppliers.sort(sortSuppliers)

  assert.deepEqual(ordered.map((supplier) => supplier._id), ['3', '2', '1'])
})

test('getRecentReviews retourne les deux derniers avis triés par date décroissante avec auteur abrégé', () => {
  const supplier = createSupplier()
  const previews = getRecentReviews(supplier, 2)

  assert.equal(previews.length, 2)
  assert.deepEqual(previews.map((preview) => preview.review._id), ['r3', 'r2'])
  assert.deepEqual(previews.map((preview) => preview.authorName), ['Plany.tn', 'Agence P.'])
})

test('abbreviateName et truncateText formatent correctement les textes', () => {
  assert.equal(abbreviateName('Jean Dupont'), 'Jean D.')
  assert.equal(abbreviateName('Plany'), 'Plany')
  assert.equal(truncateText('Service de très grande qualité', 12), 'Service de…')
})

test('buildSupplierStructuredData génère un schéma JSON-LD complet', () => {
  const supplier = createSupplier({ slug: 'plany-cars', score: 4.6, reviewCount: 3 })
  const structured = buildSupplierStructuredData(supplier)

  assert.equal(structured['@type'], 'Thing')
  assert.equal(structured.name, 'Agence Test')
  assert.equal(structured.url, 'https://plany.tn/search/agence/plany-cars')
  assert.equal(structured.aggregateRating.reviewCount, 3)
  assert.equal(structured.aggregateRating.ratingValue, 4.6)
  assert.equal(structured.aggregateRating.worstRating, 0)
  assert.equal(structured.review.length, 2)
  assert.equal(structured.review[0].author['@type'], 'Organization')
  assert.equal(structured.review[1].author['@type'], 'Person')
  assert.equal(structured.review[0].reviewRating.bestRating, 5)
  assert.equal(structured.review[0].reviewRating.worstRating, 0)
})

test('buildSupplierStructuredData normalise les scores supérieurs à 5 sur une échelle 0-5', () => {
  const supplier = createSupplier({
    slug: 'score-eleve',
    score: 96,
    reviewCount: 4,
    reviews: [
      createReview({ _id: 'r5', user: 'u5', rating: 95, createdAt: '2024-04-01T08:00:00.000Z' }),
      createReview({ _id: 'r6', user: 'u6', rating: 88, createdAt: '2024-04-02T08:00:00.000Z' }),
    ],
  })

  const structured = buildSupplierStructuredData(supplier)

  assert.equal(structured.aggregateRating.ratingValue, 4.8)
  assert.equal(structured.review[0].reviewRating.ratingValue, 4.4)
  assert.equal(structured.review[1].reviewRating.ratingValue, 4.8)
})

test('getReviewCount, getSortedReviews et getReviewAuthorName gèrent les cas limites', () => {
  const supplier = createSupplier({ reviewCount: undefined })

  assert.equal(getReviewCount(supplier), 3)

  const sorted = getSortedReviews(supplier)
  assert.equal(sorted[0]._id, 'r3')
  assert.equal(sorted[sorted.length - 1]._id, 'r1')

  const authorName = getReviewAuthorName(supplier, sorted[1])
  assert.equal(authorName, 'Agence Premium')
})

test('resolveReviewAuthorNames privilégie reviewerFullName et gère le fallback', () => {
  const supplier = createSupplier()
  const review = createReview({ _id: 'r4', user: 'u2' })

  const fromReview = resolveReviewAuthorNames(null, {
    ...review,
    reviewerFullName: 'Cliente Premium',
  })

  assert.equal(fromReview.fullName, 'Cliente Premium')
  assert.equal(fromReview.abbreviated, 'Cliente P.')

  const fromSupplier = resolveReviewAuthorNames(supplier, review)
  assert.equal(fromSupplier.fullName, 'Agence Premium')
  assert.equal(fromSupplier.abbreviated, 'Agence P.')
})

test('getReservationCount renvoie une valeur positive même sans reservationCount explicite', () => {
  const supplier = createSupplier({ reservationCount: undefined })
  const fallbackSupplier = createSupplier({ reservationCount: undefined, reservations: 12 })

  assert.equal(getReservationCount(supplier), 0)
  assert.equal(getReservationCount(fallbackSupplier), 12)
})
