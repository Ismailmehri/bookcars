import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config.js'
import { calculateDailyRate, normalizePrice } from '@/common/pricing'
import * as helper from '@/common/helper'
import { buildSupplierLinkMessage, getSupplierProfilePath } from '@/common/supplier'
import { getDefaultAnalyticsCurrency } from '@/common/gtm'
import { strings as commonStrings } from '@/lang/common'

export interface CarCardPricing {
  rentalFrom: Date
  rentalTo: Date
  rentalDays: number
  dailyRate: number
  formattedDailyRate: string
  priceSummary: string
  safeTotal: number
}

export interface CarCardViewModel extends CarCardPricing {
  productData: Record<string, unknown>
  supplierProfilePath: string
  supplierLinkDescription?: string
  disableBooking: boolean
  showDiscountBadge: boolean
}

export const resolveRentalWindow = (from?: Date, to?: Date) => {
  const rentalFrom = from ?? new Date()
  const rentalTo = to ?? rentalFrom
  const computedDays = bookcarsHelper.days(rentalFrom, rentalTo)
  const rentalDays = Math.max(computedDays, 1)

  return { rentalFrom, rentalTo, rentalDays }
}

export const buildPricing = (
  car: bookcarsTypes.Car,
  rentalFrom: Date,
  rentalTo: Date,
  rentalDays: number,
  language: string,
): CarCardPricing => {
  const totalPrice = bookcarsHelper.calculateTotalPrice(car, rentalFrom, rentalTo)
  const safeTotal = normalizePrice(totalPrice)
  const dailyRate = calculateDailyRate(totalPrice, rentalDays)
  const formattedDailyRate = bookcarsHelper.formatPrice(dailyRate, commonStrings.CURRENCY, language)
  const priceSummary = `${helper.getDays(rentalDays)} : ${bookcarsHelper.formatPrice(safeTotal, commonStrings.CURRENCY, language)}`

  return {
    rentalFrom,
    rentalTo,
    rentalDays,
    dailyRate,
    formattedDailyRate,
    priceSummary,
    safeTotal,
  }
}

export const buildStructuredProductData = (car: bookcarsTypes.Car): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: car.name,
  image: bookcarsHelper.joinURL(env.CDN_CARS, car.image),
  offers: {
    '@type': 'Offer',
    price: car.dailyPrice ?? 0,
    priceCurrency: 'TND',
    availability: 'https://schema.org/InStock',
  },
})

export const buildSupplierDescription = (
  car: bookcarsTypes.Car,
  language: string,
): string | undefined => {
  const hasDailyPrice = typeof car.dailyPrice === 'number' && Number.isFinite(car.dailyPrice)
  const supplierDailyPriceLabel = hasDailyPrice
    ? bookcarsHelper.formatPrice(normalizePrice(car.dailyPrice ?? 0), commonStrings.CURRENCY, language)
    : undefined

  return buildSupplierLinkMessage({
    supplierName: car.supplier.fullName,
    dailyPriceLabel: supplierDailyPriceLabel,
    dailySuffix: commonStrings.DAILY,
  })
}

export const buildCarCardViewModel = (
  car: bookcarsTypes.Car,
  options: {
    from?: Date
    to?: Date
    language: string
  },
): CarCardViewModel => {
  const { rentalFrom, rentalTo, rentalDays } = resolveRentalWindow(options.from, options.to)
  const pricing = buildPricing(car, rentalFrom, rentalTo, rentalDays, options.language)

  const supplierProfilePath = getSupplierProfilePath(car.supplier.slug ?? '')
  const supplierLinkDescription = buildSupplierDescription(car, options.language)

  return {
    ...pricing,
    productData: buildStructuredProductData(car),
    supplierProfilePath,
    supplierLinkDescription,
    disableBooking: Boolean(car.minimumRentalDays && pricing.rentalDays < car.minimumRentalDays),
    showDiscountBadge: Boolean(car?.discounts?.percentage && pricing.rentalDays >= (car.discounts?.threshold ?? 0)),
  }
}

export const getCheckoutPayload = (car: bookcarsTypes.Car, viewModel: CarCardPricing) => ({
  value: viewModel.safeTotal,
  currency: getDefaultAnalyticsCurrency(),
  items: [{
    id: car._id,
    name: car.name,
    quantity: viewModel.rentalDays,
    price: viewModel.dailyRate,
    category: car.range,
  }],
  contentType: car.range,
})
