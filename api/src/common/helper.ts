import fs from 'node:fs/promises'
import path from 'node:path'
import mongoose from 'mongoose'
import validator from 'validator'
import Stripe from 'stripe'
import { nanoid } from 'nanoid'
import axios from 'axios'
import * as bookcarsTypes from ':bookcars-types'
import i18n from '../lang/i18n'

/**
 * Convert string to boolean.
 *
 * @export
 * @param {string} input
 * @returns {boolean}
 */
export const StringToBoolean = (input: string): boolean => {
  try {
    return Boolean(JSON.parse(input.toLowerCase()))
  } catch {
    return false
  }
}

/**
 * Check if a file exists.
 *
 * @export
 * @async
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
export const exists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Create a folder recursively.
 *
 * @export
 * @async
 * @param {string} folder
 * @param {boolean} recursive
 * @returns {Promise<void>}
 */
export const mkdir = async (folder: string) => {
  await fs.mkdir(folder, { recursive: true })
}

/**
 * Removes a start line terminator character from a string.
 *
 * @export
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export const trimStart = (str: string, char: string): string => {
  let res = str
  while (res.charAt(0) === char) {
    res = res.substring(1, res.length)
  }
  return res
}

/**
 * Removes a leading and trailing line terminator character from a string.
 *
 * @export
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export const trimEnd = (str: string, char: string): string => {
  let res = str
  while (res.charAt(res.length - 1) === char) {
    res = res.substring(0, res.length - 1)
  }
  return res
}

/**
 * Removes a stating, leading and trailing line terminator character from a string.
 *
 * @export
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export const trim = (str: string, char: string): string => {
  let res = trimStart(str, char)
  res = trimEnd(res, char)
  return res
}

/**
 * Join two url parts.
 *
 * @export
 * @param {string} part1
 * @param {string} part2
 * @returns {string}
 */
export const joinURL = (part1: string, part2: string): string => {
  const p1 = trimEnd(part1, '/')
  let p2 = part2

  if (part2.charAt(0) === '/') {
    p2 = part2.substring(1)
  }

  return `${p1}/${p2}`
}

/**
 * Get filename without extension.
 *
 * @export
 * @param {string} filename
 * @returns {string}
 */
export const getFilenameWithoutExtension = (filename: string): string => path.parse(filename).name

/**
 * Clone an object or an array.
 *
 * @param {*} obj
 * @returns {*}
 */
export const clone = (obj: any) => (Array.isArray(obj) ? Array.from(obj) : ({ ...obj }))

/**
 * Check ObjectId.
 *
 * @param {?string} id
 * @returns {boolean}
 */
export const isValidObjectId = (id?: string) => mongoose.isValidObjectId(id)

/**
 * Check email.
 *
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email?: string) => !!email && validator.isEmail(email)

/**
 * Generate user token.
 *
 * @returns {string}
 */
export const generateToken = () => `${nanoid()}-${Date.now()}`

/**
 * The IETF language tag of the locale Checkout is displayed in.
 *
 * @param {string} locale
 * @returns {Stripe.Checkout.SessionCreateParams.Locale}
 */
export const getStripeLocale = (locale: string): Stripe.Checkout.SessionCreateParams.Locale => {
  const locales = [
    'bg',
    'cs',
    'da',
    'de',
    'el',
    'en',
    'en-GB',
    'es',
    'es-419',
    'et',
    'fi',
    'fil',
    'fr',
    'fr-CA',
    'hr',
    'hu',
    'id',
    'it',
    'ja',
    'ko',
    'lt',
    'lv',
    'ms',
    'mt',
    'nb',
    'nl',
    'pl',
    'pt',
    'pt-BR',
    'ro',
    'ru',
    'sk',
    'sl',
    'sv',
    'th',
    'tr',
    'vi',
    'zh',
    'zh-HK',
    'zh-TW',
  ]

  if (locales.includes(locale)) {
    return locale as Stripe.Checkout.SessionCreateParams.Locale
  }

  return 'auto'
}

/**
 * Parse JWT token.
 *
 * @param {string} token
 * @returns {any}
 */
export const parseJwt = (token: string) => JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())

/**
 * Validate JWT token structure.
 *
 * @param {string} token
 * @returns {boolean}
 */
export const validateAccessToken = async (socialSignInType: bookcarsTypes.SocialSignInType, token: string, email: string) => {
  if (socialSignInType === bookcarsTypes.SocialSignInType.Facebook) {
    try {
      parseJwt(token)
      return true
    } catch {
      return false
    }
  }

  if (socialSignInType === bookcarsTypes.SocialSignInType.Apple) {
    try {
      const res = parseJwt(token)
      return res.email === email
    } catch {
      return false
    }
  }

  if (socialSignInType === bookcarsTypes.SocialSignInType.Google) {
    try {
      const res = await axios.get(
        'https://www.googleapis.com/oauth2/v3/tokeninfo',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      return res.data.email === email
    } catch {
      return false
    }
  }

  return false
}

export const admin = (user?: bookcarsTypes.User): boolean => (user && user.type === bookcarsTypes.RecordType.Admin) ?? false

export const supplier = (user?: bookcarsTypes.User): boolean => (user && user.type === bookcarsTypes.RecordType.Supplier) ?? false

const SCORE_CONFIG = {
  PHONE_MAX: 10, // Points maximum pour le téléphone
  CAR_CONFIGURATION_PERIODIC_PRICES_MAX: 15, // Points maximum pour les prix périodiques
  CAR_CONFIGURATION_UNAVAILABLE_PERIODS_MAX: 0, // Points maximum pour les périodes d'indisponibilité
  POST_RENTAL_MANAGEMENT_EXPIRED_PENDING_MAX: 30, // Points maximum pour les bookings expirés avec statut "pending"
  POST_RENTAL_MANAGEMENT_EXPIRED_RESERVED_DEPOSIT_MAX: 10, // Points maximum pour les bookings expirés avec statut "reserved" ou "deposit"
  POST_RENTAL_MANAGEMENT_CANCELLED_VOID_RATIO_MAX: 5, // Points maximum pour le ratio de statuts "cancelled" et "void"
  CAR_QUANTITY_MAX: 10, // Points maximum pour la quantité de voitures
  BOOKING_STATUS_HEALTH_MAX: 20, // Points maximum pour la santé des réservations
}

/**
 * Get booking status label.
 *
 * @param {string} status
 * @returns {string}
 */
export const getBookingStatus = (status?: bookcarsTypes.BookingStatus) => {
  switch (status) {
    case bookcarsTypes.BookingStatus.Void:
      return i18n.t('BOOKING_STATUS_VOID')

    case bookcarsTypes.BookingStatus.Pending:
      return i18n.t('BOOKING_STATUS_PENDING')

    case bookcarsTypes.BookingStatus.Deposit:
      return i18n.t('BOOKING_STATUS_DEPOSIT')

    case bookcarsTypes.BookingStatus.Paid:
      return i18n.t('BOOKING_STATUS_PAID')

    case bookcarsTypes.BookingStatus.Reserved:
      return i18n.t('BOOKING_STATUS_RESERVED')

    case bookcarsTypes.BookingStatus.Cancelled:
      return i18n.t('BOOKING_STATUS_CANCELLED')

    default:
      return ''
  }
}

interface ScoreBreakdown {
  total: number; // Score total sur 100
  details: {
    phone: {
      score: number; // Score pour la présence d'un téléphone
      max: number; // Points maximum pour cette catégorie
    };
    carConfiguration: {
      periodicPrices: {
        score: number; // Score pour les prix périodiques configurés
        max: number; // Points maximum pour cette catégorie
        configuredCars: number; // Nombre de voitures avec des prix périodiques configurés
      };
      unavailablePeriods: {
        score: number; // Score pour les périodes d'indisponibilité configurées
        max: number; // Points maximum pour cette catégorie
        configuredCars: number; // Nombre de voitures avec des périodes d'indisponibilité configurées
      };
    };
    postRentalManagement: {
      expiredPending: {
        score: number; // Score pour les bookings expirés avec statut "pending"
        max: number; // Points maximum pour cette catégorie
      };
      expiredReservedDeposit: {
        score: number; // Score pour les bookings expirés avec statut "reserved" ou "deposit"
        max: number; // Points maximum pour cette catégorie
      };
      cancelledVoidRatio: {
        score: number; // Score pour le ratio de statuts "cancelled" et "void"
        max: number; // Points maximum pour cette catégorie
      };
    };
    carQuantity: {
      score: number; // Score pour la quantité de voitures
      max: number; // Points maximum pour cette catégorie
    };
    bookingStatusHealth: {
      score: number; // Score pour la santé des réservations
      max: number; // Points maximum pour cette catégorie
      ratio: number; // Ratio de réservations valides
    };
  };
  recommendations: string[]; // Recommandations pour améliorer le score
}

  /**
   * Calculate agency score based on bookings and cars.
   *
   * @param {bookcarsTypes.User} agency
   * @param {Booking[]} bookings
   * @param {Car[]} cars
   * @returns {ScoreBreakdown}
   */
  export function calculateAgencyScore(agency: bookcarsTypes.User, bookings: bookcarsTypes.Booking[], cars: bookcarsTypes.Car[]): ScoreBreakdown {
    const breakdown: ScoreBreakdown = {
      total: 0,
      details: {
        phone: { score: 0, max: SCORE_CONFIG.PHONE_MAX },
        carConfiguration: {
          periodicPrices: { score: 0, max: SCORE_CONFIG.CAR_CONFIGURATION_PERIODIC_PRICES_MAX, configuredCars: 0 },
          unavailablePeriods: { score: 0, max: SCORE_CONFIG.CAR_CONFIGURATION_UNAVAILABLE_PERIODS_MAX, configuredCars: 0 },
        },
        postRentalManagement: {
          expiredPending: { score: 0, max: SCORE_CONFIG.POST_RENTAL_MANAGEMENT_EXPIRED_PENDING_MAX },
          expiredReservedDeposit: { score: 0, max: SCORE_CONFIG.POST_RENTAL_MANAGEMENT_EXPIRED_RESERVED_DEPOSIT_MAX },
          cancelledVoidRatio: { score: 0, max: SCORE_CONFIG.POST_RENTAL_MANAGEMENT_CANCELLED_VOID_RATIO_MAX },
        },
        carQuantity: { score: 0, max: SCORE_CONFIG.CAR_QUANTITY_MAX },
        bookingStatusHealth: { score: 0, max: SCORE_CONFIG.BOOKING_STATUS_HEALTH_MAX, ratio: 0 },
      },
      recommendations: [],
    }

    // Fonction utilitaire pour ajouter une recommandation seulement si elle rapporte des points
    const addRecommendation = (message: string, points: number) => {
      if (points > 0) {
        breakdown.recommendations.push(`${message} (+${points} points)`)
      }
    }

    // 1. Téléphone (10 points)
    breakdown.details.phone.score = agency.phone ? SCORE_CONFIG.PHONE_MAX : 0
    if (!agency.phone) {
      addRecommendation('Ajouter un numéro de téléphone', SCORE_CONFIG.PHONE_MAX)
    }

    // 2. Configuration des voitures (30 points)
    cars.forEach((car) => {
      if (car.periodicPrices?.length > 0) {
        breakdown.details.carConfiguration.periodicPrices.configuredCars += 1
      }
      if (car.unavailablePeriods?.length > 0) {
        breakdown.details.carConfiguration.unavailablePeriods.configuredCars += 1
      }
    })

    breakdown.details.carConfiguration.periodicPrices.score = cars.length > 0
      ? Math.round((breakdown.details.carConfiguration.periodicPrices.configuredCars / cars.length) * SCORE_CONFIG.CAR_CONFIGURATION_PERIODIC_PRICES_MAX)
      : SCORE_CONFIG.CAR_CONFIGURATION_PERIODIC_PRICES_MAX

    breakdown.details.carConfiguration.unavailablePeriods.score = cars.length > 0
      ? Math.round((breakdown.details.carConfiguration.unavailablePeriods.configuredCars / cars.length) * SCORE_CONFIG.CAR_CONFIGURATION_UNAVAILABLE_PERIODS_MAX)
      : SCORE_CONFIG.CAR_CONFIGURATION_UNAVAILABLE_PERIODS_MAX

    addRecommendation(
      'Configurer les prix périodiques sur toutes les voitures',
      Math.round(SCORE_CONFIG.CAR_CONFIGURATION_PERIODIC_PRICES_MAX - breakdown.details.carConfiguration.periodicPrices.score),
    )

    addRecommendation(
      "Configurer les périodes d'indisponibilité sur toutes les voitures",
      Math.round(SCORE_CONFIG.CAR_CONFIGURATION_UNAVAILABLE_PERIODS_MAX - breakdown.details.carConfiguration.unavailablePeriods.score),
    )

    // 3. Gestion post-réservation (20 points)
    const now = new Date()
    let expiredPendingBookings = 0 // Bookings expirés avec statut "En cours" (grave)
    let expiredReservedDepositBookings = 0 // Bookings expirés avec statut "Réservée" ou "Acompte" (moins grave)
    let cancelledVoidBookings = 0 // Bookings avec statut "Annulée" ou "Vide"

    bookings.forEach((booking) => {
      const bookingEndDate = new Date(booking.to)

      // 3a. Bookings expirés avec statut "En cours" (grave)
      if (bookingEndDate < now && booking.status === bookcarsTypes.BookingStatus.Pending) {
        expiredPendingBookings += 1
      }

      // 3b. Bookings expirés avec statut "Réservée" ou "Acompte" (moins grave)
      if (
        bookingEndDate < now
        && (booking.status === bookcarsTypes.BookingStatus.Reserved || booking.status === bookcarsTypes.BookingStatus.Deposit)
      ) {
        expiredReservedDepositBookings += 1
      }

      // 3c. Bookings avec statut "Annulée" ou "Vide"
      if (booking.status === bookcarsTypes.BookingStatus.Cancelled || booking.status === bookcarsTypes.BookingStatus.Void) {
        cancelledVoidBookings += 1
      }
    })

    breakdown.details.postRentalManagement.expiredPending.score = bookings.length > 0
      ? Math.max(
          0,
          SCORE_CONFIG.POST_RENTAL_MANAGEMENT_EXPIRED_PENDING_MAX
            - (expiredPendingBookings / bookings.length) * SCORE_CONFIG.POST_RENTAL_MANAGEMENT_EXPIRED_PENDING_MAX,
        )
      : SCORE_CONFIG.POST_RENTAL_MANAGEMENT_EXPIRED_PENDING_MAX

    breakdown.details.postRentalManagement.expiredReservedDeposit.score = bookings.length > 0
      ? Math.max(
          0,
          SCORE_CONFIG.POST_RENTAL_MANAGEMENT_EXPIRED_RESERVED_DEPOSIT_MAX
            - (expiredReservedDepositBookings / bookings.length) * SCORE_CONFIG.POST_RENTAL_MANAGEMENT_EXPIRED_RESERVED_DEPOSIT_MAX,
        )
      : SCORE_CONFIG.POST_RENTAL_MANAGEMENT_EXPIRED_RESERVED_DEPOSIT_MAX

    const CANCELLATION_THRESHOLD = 0.3
    const MAX_SCORE = SCORE_CONFIG.POST_RENTAL_MANAGEMENT_CANCELLED_VOID_RATIO_MAX

    const totalBookings = bookings.length
    const cancelledVoidRatio = totalBookings > 0
      ? cancelledVoidBookings / totalBookings
      : 0

    if (totalBookings === 0) {
      breakdown.details.postRentalManagement.cancelledVoidRatio.score = MAX_SCORE
    } else if (cancelledVoidRatio <= CANCELLATION_THRESHOLD) {
      breakdown.details.postRentalManagement.cancelledVoidRatio.score = MAX_SCORE
    } else {
      const excessRatio = (cancelledVoidRatio - CANCELLATION_THRESHOLD) / (1 - CANCELLATION_THRESHOLD)
      breakdown.details.postRentalManagement.cancelledVoidRatio.score = MAX_SCORE * (1 - excessRatio)
    }

    if (expiredPendingBookings > 0) {
      addRecommendation(
        `Mettre à jour ${expiredPendingBookings} réservation(s) expirée(s) avec statut "${getBookingStatus(bookcarsTypes.BookingStatus.Pending)}"`,
        Math.round(SCORE_CONFIG.POST_RENTAL_MANAGEMENT_EXPIRED_PENDING_MAX - breakdown.details.postRentalManagement.cancelledVoidRatio.score),
      )
    }

    if (expiredReservedDepositBookings > 0) {
      addRecommendation(
        `Mettre à jour ${expiredReservedDepositBookings} réservation(s) expirée(s) avec statut "${getBookingStatus(bookcarsTypes.BookingStatus.Reserved)}" ou "${getBookingStatus(bookcarsTypes.BookingStatus.Deposit)}"`,
        Math.round(SCORE_CONFIG.POST_RENTAL_MANAGEMENT_EXPIRED_RESERVED_DEPOSIT_MAX - breakdown.details.postRentalManagement.expiredReservedDeposit.score),
      )
    }

    if (cancelledVoidRatio > CANCELLATION_THRESHOLD) {
      addRecommendation(
        `Réduire le nombre de réservations avec statut "${getBookingStatus(bookcarsTypes.BookingStatus.Cancelled)}" ou "${getBookingStatus(bookcarsTypes.BookingStatus.Void)}"`,
        Math.round(SCORE_CONFIG.POST_RENTAL_MANAGEMENT_CANCELLED_VOID_RATIO_MAX - breakdown.details.postRentalManagement.cancelledVoidRatio.score),
      )
    }

    // 4. Quantité de voitures (10 points)
    breakdown.details.carQuantity.score = cars.length >= 5
      ? SCORE_CONFIG.CAR_QUANTITY_MAX
      : Math.round((cars.length / 5) * SCORE_CONFIG.CAR_QUANTITY_MAX)

    addRecommendation(
      'Ajouter plus de voitures pour atteindre 5 voitures',
      Math.round(SCORE_CONFIG.CAR_QUANTITY_MAX - breakdown.details.carQuantity.score),
    )

    // 5. Santé des réservations (30 points)
    if (bookings.length > 0) {
      const validStatuses = [
        bookcarsTypes.BookingStatus.Paid,
        bookcarsTypes.BookingStatus.Reserved,
        bookcarsTypes.BookingStatus.Deposit,
      ]
      const validBookings = bookings.filter((b) => validStatuses.includes(b.status)).length

      const totalValidBookings = bookings.length - cancelledVoidBookings
      const bookingHealthRatio = totalValidBookings > 0 ? validBookings / totalValidBookings : 1

      breakdown.details.bookingStatusHealth.ratio = bookingHealthRatio
      breakdown.details.bookingStatusHealth.score = Math.round(bookingHealthRatio * SCORE_CONFIG.BOOKING_STATUS_HEALTH_MAX)

      if (breakdown.details.bookingStatusHealth.ratio < 1) {
        const validStatusesFrench = validStatuses.map((status) => getBookingStatus(status)).join(', ')
        addRecommendation(
          `Améliorer la santé des réservations en augmentant le nombre de réservations avec statut ${validStatusesFrench}`,
          Math.round(SCORE_CONFIG.BOOKING_STATUS_HEALTH_MAX - breakdown.details.bookingStatusHealth.score),
        )
      }
    } else {
      breakdown.details.bookingStatusHealth.score = SCORE_CONFIG.BOOKING_STATUS_HEALTH_MAX
    }

    // Calcul du total
    const sumScores = (obj: any): number => {
      if (typeof obj === 'object' && obj !== null) {
        if (typeof obj.score === 'number') {
          return obj.score + Object.values(obj).reduce((sum: number, value) => sum + sumScores(value), 0)
        }
        return Object.values(obj).reduce((sum: number, value) => sum + sumScores(value), 0)
      }
      return 0
    }

    breakdown.total = Math.min(100, Math.round(sumScores(breakdown.details)))

    return breakdown
  }
