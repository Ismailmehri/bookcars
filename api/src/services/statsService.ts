import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import Booking from '../models/Booking'
import { CarStats } from '../models/CarStats'
import Car from '../models/Car'
import User from '../models/User'

const ACCEPTED_STATUSES: bookcarsTypes.BookingStatus[] = [
  bookcarsTypes.BookingStatus.Paid,
  bookcarsTypes.BookingStatus.Deposit,
  bookcarsTypes.BookingStatus.Reserved,
]

const CANCELLED_STATUSES: bookcarsTypes.BookingStatus[] = [
  bookcarsTypes.BookingStatus.Cancelled,
  bookcarsTypes.BookingStatus.Void,
]

const MS_PER_DAY = 24 * 60 * 60 * 1000

export interface BookingMetricDocument {
  status: bookcarsTypes.BookingStatus
  price: number
  from: Date
  to: Date
  createdAt: Date
  supplierId: string
  supplierName: string
  carId: string
  carName: string
  driverId?: string | null
  paymentIntentId?: string | null
  sessionId?: string | null
}

interface ViewsAggregationDocument {
  date: string
  organique: number
  paid: number
  total: number
}

const clampDate = (value: Date, minDate: Date, maxDate: Date) => {
  if (value.getTime() < minDate.getTime()) {
    return new Date(minDate)
  }

  if (value.getTime() > maxDate.getTime()) {
    return new Date(maxDate)
  }

  return value
}

const inclusiveDaysBetween = (start: Date, end: Date) => {
  const diff = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY)
  return diff >= 0 ? diff + 1 : 0
}

const calculateBookedDays = (
  booking: BookingMetricDocument,
  rangeStart: Date,
  rangeEnd: Date,
) => {
  const from = clampDate(new Date(booking.from), rangeStart, rangeEnd)
  const to = clampDate(new Date(booking.to), rangeStart, rangeEnd)

  if (to.getTime() < from.getTime()) {
    return 0
  }

  return inclusiveDaysBetween(from, to)
}

const groupByStatus = (bookings: BookingMetricDocument[]) => {
  const map = new Map<bookcarsTypes.BookingStatus, { count: number; totalPrice: number }>()

  bookings.forEach((booking) => {
    const status = booking.status ?? bookcarsTypes.BookingStatus.Pending
    const entry = map.get(status) ?? { count: 0, totalPrice: 0 }
    const price = Number.isFinite(booking.price) ? booking.price : 0

    map.set(status, {
      count: entry.count + 1,
      totalPrice: entry.totalPrice + price,
    })
  })

  return Array.from(map.entries()).map(([status, value]) => ({
    status,
    count: value.count,
    totalPrice: value.totalPrice,
  }))
}

const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const getIsoWeekKey = (date: Date) => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNumber = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7)
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

const buildRevenueSeries = (
  bookings: BookingMetricDocument[],
  extractor: (date: Date) => string,
): bookcarsTypes.RevenueTimePoint[] => {
  const map = new Map<string, { revenue: number; bookings: number }>()

  bookings.forEach((booking) => {
    if (!ACCEPTED_STATUSES.includes(booking.status)) {
      return
    }

    const dateKey = extractor(new Date(booking.from))
    const current = map.get(dateKey) ?? { revenue: 0, bookings: 0 }
    const price = Number.isFinite(booking.price) ? booking.price : 0

    map.set(dateKey, {
      revenue: current.revenue + price,
      bookings: current.bookings + 1,
    })
  })

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, value]) => ({ period, ...value }))
}

const buildModelRevenue = (bookings: BookingMetricDocument[]): bookcarsTypes.AgencyModelRevenueStat[] => {
  const map = new Map<string, { name: string; revenue: number; bookings: number }>()

  bookings.forEach((booking) => {
    if (!ACCEPTED_STATUSES.includes(booking.status)) {
      return
    }

    const price = Number.isFinite(booking.price) ? booking.price : 0
    const entry = map.get(booking.carId) ?? { name: booking.carName, revenue: 0, bookings: 0 }

    map.set(booking.carId, {
      name: booking.carName,
      revenue: entry.revenue + price,
      bookings: entry.bookings + 1,
    })
  })

  return Array.from(map.entries())
    .map(([modelId, value]) => ({
      modelId,
      modelName: value.name,
      revenue: value.revenue,
      bookings: value.bookings,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

const buildModelOccupancy = (
  bookings: BookingMetricDocument[],
  rangeStart: Date,
  rangeEnd: Date,
): bookcarsTypes.AgencyModelOccupancyStat[] => {
  const totalDays = inclusiveDaysBetween(rangeStart, rangeEnd)

  if (totalDays <= 0) {
    return []
  }

  const map = new Map<string, { name: string; bookedDays: number }>()

  bookings.forEach((booking) => {
    if (!ACCEPTED_STATUSES.includes(booking.status)) {
      return
    }

    const bookedDays = calculateBookedDays(booking, rangeStart, rangeEnd)
    const entry = map.get(booking.carId) ?? { name: booking.carName, bookedDays: 0 }

    map.set(booking.carId, {
      name: booking.carName,
      bookedDays: entry.bookedDays + bookedDays,
    })
  })

  return Array.from(map.entries())
    .map(([modelId, value]) => ({
      modelId,
      modelName: value.name,
      bookedDays: value.bookedDays,
      totalDays,
      occupancyRate: totalDays > 0 ? Math.min(value.bookedDays / totalDays, 1) : 0,
    }))
    .sort((a, b) => b.occupancyRate - a.occupancyRate)
}

const buildCancellationByPaymentStatus = (
  bookings: BookingMetricDocument[],
): bookcarsTypes.PaymentStatusCancellationStat[] => {
  const counters: Record<'deposit' | 'paid', number> = { deposit: 0, paid: 0 }

  bookings.forEach((booking) => {
    if (booking.status !== bookcarsTypes.BookingStatus.Cancelled) {
      return
    }

    const key: 'deposit' | 'paid' = booking.paymentIntentId ? 'paid' : 'deposit'
    counters[key] += 1
  })

  return [
    { paymentStatus: 'deposit', count: counters.deposit },
    { paymentStatus: 'paid', count: counters.paid },
  ]
}

const calculateAverage = (values: number[]) => {
  if (values.length === 0) {
    return 0
  }

  const sum = values.reduce((total, value) => total + value, 0)
  return sum / values.length
}

const calculateAverageDuration = (bookings: BookingMetricDocument[]) => {
  const durations = bookings
    .filter((booking) => ACCEPTED_STATUSES.includes(booking.status))
    .map((booking) => inclusiveDaysBetween(new Date(booking.from), new Date(booking.to)))

  return calculateAverage(durations)
}

const calculateAverageLeadTime = (bookings: BookingMetricDocument[]) => {
  const leadTimes = bookings
    .filter((booking) => ACCEPTED_STATUSES.includes(booking.status) && booking.createdAt)
    .map((booking) => {
      const from = new Date(booking.from)
      const createdAt = new Date(booking.createdAt)
      return Math.max(0, Math.floor((from.getTime() - createdAt.getTime()) / MS_PER_DAY))
    })

  return calculateAverage(leadTimes)
}

const calculateRebookingRate = (bookings: BookingMetricDocument[]) => {
  const accepted = bookings.filter((booking) => ACCEPTED_STATUSES.includes(booking.status))

  if (accepted.length === 0) {
    return 0
  }

  const counts = accepted.reduce<Map<string, number>>((acc, booking) => {
    if (!booking.driverId) {
      return acc
    }

    const current = acc.get(booking.driverId) ?? 0
    acc.set(booking.driverId, current + 1)
    return acc
  }, new Map())

  if (counts.size === 0) {
    return 0
  }

  const repeaters = Array.from(counts.values()).filter((count) => count > 1).length
  return counts.size > 0 ? repeaters / counts.size : 0
}

const calculateOccupancyRate = (
  bookings: BookingMetricDocument[],
  totalCars: number,
  rangeStart: Date,
  rangeEnd: Date,
) => {
  if (totalCars <= 0) {
    return 0
  }

  const totalDays = inclusiveDaysBetween(rangeStart, rangeEnd)

  if (totalDays <= 0) {
    return 0
  }

  const bookedDays = bookings
    .filter((booking) => ACCEPTED_STATUSES.includes(booking.status))
    .reduce((total, booking) => total + calculateBookedDays(booking, rangeStart, rangeEnd), 0)

  const capacity = totalDays * totalCars
  if (capacity <= 0) {
    return 0
  }

  return Math.min(bookedDays / capacity, 1)
}

const buildTopModels = (bookings: BookingMetricDocument[]): bookcarsTypes.TopModelStat[] => {
  const map = new Map<string, { bookings: number; name: string; supplierId: string; supplierName: string }>()

  bookings.forEach((booking) => {
    if (!ACCEPTED_STATUSES.includes(booking.status)) {
      return
    }

    const entry = map.get(booking.carId) ?? {
      bookings: 0,
      name: booking.carName,
      supplierId: booking.supplierId,
      supplierName: booking.supplierName,
    }

    map.set(booking.carId, {
      bookings: entry.bookings + 1,
      name: booking.carName,
      supplierId: booking.supplierId,
      supplierName: booking.supplierName,
    })
  })

  return Array.from(map.entries())
    .map(([modelId, value]) => ({
      model: value.name,
      bookings: value.bookings,
      agencyId: value.supplierId,
      agencyName: value.supplierName,
      modelId,
    }))
    .sort((a, b) => b.bookings - a.bookings)
}

const fetchBookings = async (
  startDate: Date,
  endDate: Date,
  supplierId?: mongoose.Types.ObjectId,
): Promise<BookingMetricDocument[]> => {
  const match: Record<string, unknown> = {
    from: { $gte: startDate, $lte: endDate },
  }

  if (supplierId) {
    match.supplier = supplierId
  }

  const bookings = await Booking.aggregate<BookingMetricDocument>([
    { $match: match },
    {
      $lookup: {
        from: 'Car',
        localField: 'car',
        foreignField: '_id',
        as: 'carDoc',
      },
    },
    { $unwind: '$carDoc' },
    {
      $lookup: {
        from: 'User',
        localField: 'supplier',
        foreignField: '_id',
        as: 'supplierDoc',
      },
    },
    { $unwind: '$supplierDoc' },
    {
      $project: {
        status: 1,
        price: { $ifNull: ['$price', 0] },
        from: 1,
        to: 1,
        createdAt: 1,
        supplierId: { $toString: '$supplierDoc._id' },
        supplierName: '$supplierDoc.fullName',
        carId: { $toString: '$carDoc._id' },
        carName: '$carDoc.name',
        driverId: {
          $cond: [
            { $ifNull: ['$driver', false] },
            { $toString: '$driver' },
            null,
          ],
        },
        paymentIntentId: { $ifNull: ['$paymentIntentId', null] },
        sessionId: { $ifNull: ['$sessionId', null] },
      },
    },
  ])

  return bookings.map((booking) => ({
    ...booking,
    status: booking.status ?? bookcarsTypes.BookingStatus.Pending,
    price: Number.isFinite(booking.price) ? booking.price : 0,
  }))
}

const fetchViews = async (
  startDate: Date,
  endDate: Date,
  supplierId?: mongoose.Types.ObjectId,
): Promise<ViewsAggregationDocument[]> => {
  const match: Record<string, unknown> = {
    viewedAt: { $gte: startDate, $lte: endDate },
  }

  if (supplierId) {
    match.supplier = supplierId
  }

  const views = await CarStats.aggregate<ViewsAggregationDocument>([
    { $match: match },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } },
        },
        organique: {
          $sum: {
            $cond: [{ $eq: ['$paidView', false] }, 1, 0],
          },
        },
        paid: {
          $sum: {
            $cond: [{ $eq: ['$paidView', true] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id.date',
        organique: 1,
        paid: 1,
        total: { $add: ['$organique', '$paid'] },
      },
    },
    { $sort: { date: 1 } },
  ])

  return views
}

const calculateAcceptanceRate = (summary: { accepted: number; total: number }) => {
  if (summary.total === 0) {
    return 0
  }

  return (summary.accepted / summary.total) * 100
}

const calculateCancellationRate = (summary: { cancelled: number; total: number }) => {
  if (summary.total === 0) {
    return 0
  }

  return (summary.cancelled / summary.total) * 100
}

const computeSummary = (
  bookings: BookingMetricDocument[],
): {
  totalBookings: number
  acceptedBookings: number
  cancelledBookings: number
} => {
  const totalBookings = bookings.length
  const acceptedBookings = bookings.filter((booking) => ACCEPTED_STATUSES.includes(booking.status)).length
  const cancelledBookings = bookings.filter((booking) => CANCELLED_STATUSES.includes(booking.status)).length

  return { totalBookings, acceptedBookings, cancelledBookings }
}

const computeRevenue = (bookings: BookingMetricDocument[]) =>
  bookings
    .filter((booking) => ACCEPTED_STATUSES.includes(booking.status))
    .reduce((total, booking) => total + (Number.isFinite(booking.price) ? booking.price : 0), 0)

const buildViewsResponse = (views: ViewsAggregationDocument[]): bookcarsTypes.ViewsTimePoint[] =>
  views.map((item) => ({
    date: item.date,
    organique: item.organique,
    paid: item.paid,
    total: item.total,
  }))

export const getAgencyStats = async (
  supplierId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date,
): Promise<bookcarsTypes.AgencyStatsResponse> => {
  const [bookings, totalCars, views] = await Promise.all([
    fetchBookings(startDate, endDate, supplierId),
    Car.countDocuments({ supplier: supplierId, deleted: { $ne: true } }),
    fetchViews(startDate, endDate, supplierId),
  ])

  const { totalBookings, acceptedBookings, cancelledBookings } = computeSummary(bookings)
  const totalRevenue = computeRevenue(bookings)
  const acceptanceRate = calculateAcceptanceRate({ accepted: acceptedBookings, total: totalBookings })
  const cancellationRate = calculateCancellationRate({ cancelled: cancelledBookings, total: totalBookings })
  const averageRevenuePerBooking = acceptedBookings > 0 ? totalRevenue / acceptedBookings : 0
  const averageDuration = calculateAverageDuration(bookings)
  const averageLeadTime = calculateAverageLeadTime(bookings)
  const rebookingRate = calculateRebookingRate(bookings)
  const occupancyRate = calculateOccupancyRate(bookings, totalCars, startDate, endDate)

  const statusBreakdown = groupByStatus(bookings)
  const monthlyRevenue = buildRevenueSeries(bookings, getMonthKey)
  const weeklyTrend = buildRevenueSeries(bookings, getIsoWeekKey).map((item) => ({
    week: item.period,
    revenue: item.revenue,
    bookings: item.bookings,
  }))
  const revenueByModel = buildModelRevenue(bookings)
  const occupancyByModel = buildModelOccupancy(bookings, startDate, endDate)
  const cancellationsByPaymentStatus = buildCancellationByPaymentStatus(bookings)
  const topModels = buildTopModels(bookings).slice(0, 5)

  return {
    summary: {
      totalRevenue,
      totalBookings,
      acceptedBookings,
      cancelledBookings,
      acceptanceRate,
      cancellationRate,
      averageRevenuePerBooking,
      averageDuration,
      occupancyRate,
      rebookingRate,
      averageLeadTime,
    },
    statusBreakdown,
    revenueByStatus: statusBreakdown,
    monthlyRevenue,
    weeklyTrend,
    viewsOverTime: buildViewsResponse(views),
    revenueByModel: revenueByModel.slice(0, 5),
    occupancyByModel: occupancyByModel.slice(0, 5),
    cancellationsByPaymentStatus,
    topModels,
  }
}

const computeConversionRate = (acceptedBookings: number, views: ViewsAggregationDocument[]) => {
  const totalViews = views.reduce((total, view) => total + view.total, 0)

  if (totalViews === 0) {
    return 0
  }

  return acceptedBookings / totalViews
}

const fetchSupplierNames = async (supplierIds: string[]) => {
  if (supplierIds.length === 0) {
    return new Map<string, { name: string }>()
  }

  const suppliers = await User.find(
    { _id: { $in: supplierIds.map((id) => new mongoose.Types.ObjectId(id)) } },
    { _id: 1, fullName: 1 },
  )
    .lean()
    .exec()

  return suppliers.reduce<Map<string, { name: string }>>((acc, supplier) => {
    acc.set(String(supplier._id), { name: supplier.fullName })
    return acc
  }, new Map())
}

const buildAverageDurationByAgency = (
  bookings: BookingMetricDocument[],
): bookcarsTypes.AgencyAverageDurationPoint[] => {
  const grouped = bookings.reduce<Map<string, { durations: number[]; supplierName: string }>>((acc, booking) => {
    if (!ACCEPTED_STATUSES.includes(booking.status)) {
      return acc
    }

    const durations = acc.get(booking.supplierId)

    const duration = inclusiveDaysBetween(new Date(booking.from), new Date(booking.to))

    if (!durations) {
      acc.set(booking.supplierId, {
        durations: [duration],
        supplierName: booking.supplierName,
      })
      return acc
    }

    durations.durations.push(duration)
    return acc
  }, new Map())

  return Array.from(grouped.entries()).map(([supplierId, value]) => ({
    agencyId: supplierId,
    agencyName: value.supplierName,
    averageDuration: calculateAverage(value.durations),
  }))
}

const computeYearlyRevenue = async (
  yearStart: Date,
  yearEnd: Date,
): Promise<number> => {
  const result = await Booking.aggregate<{ total: number }>([
    {
      $match: {
        from: { $gte: yearStart, $lte: yearEnd },
        status: { $in: ACCEPTED_STATUSES },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: { $ifNull: ['$price', 0] } },
      },
    },
  ])

  return result[0]?.total ?? 0
}

export const getAdminStats = async (
  startDate: Date,
  endDate: Date,
): Promise<bookcarsTypes.AdminStatsResponse> => {
  const [bookings, views] = await Promise.all([
    fetchBookings(startDate, endDate),
    fetchViews(startDate, endDate),
  ])

  const supplierIds = Array.from(new Set(bookings.map((booking) => booking.supplierId)))

  const [totalCars, suppliersMap] = await Promise.all([
    supplierIds.length > 0
      ? Car.countDocuments({ supplier: { $in: supplierIds.map((id) => new mongoose.Types.ObjectId(id)) }, deleted: { $ne: true } })
      : Promise.resolve(0),
    fetchSupplierNames(supplierIds),
  ])

  const { totalBookings, acceptedBookings, cancelledBookings } = computeSummary(bookings)
  const totalRevenue = computeRevenue(bookings)
  const acceptanceRate = calculateAcceptanceRate({ accepted: acceptedBookings, total: totalBookings })
  const cancellationRate = calculateCancellationRate({ cancelled: cancelledBookings, total: totalBookings })
  const occupancyRate = calculateOccupancyRate(bookings, totalCars, startDate, endDate)
  const averageRevenuePerBooking = acceptedBookings > 0 ? totalRevenue / acceptedBookings : 0
  const averageDuration = calculateAverageDuration(bookings)
  const monthlyRevenue = buildRevenueSeries(bookings, getMonthKey)
  const weeklyTrend = buildRevenueSeries(bookings, getIsoWeekKey).map((item) => ({
    week: item.period,
    revenue: item.revenue,
    bookings: item.bookings,
  }))
  const statusBreakdown = groupByStatus(bookings)
  const revenueByModel = buildModelRevenue(bookings)
  const occupancyByModel = buildModelOccupancy(bookings, startDate, endDate)
  const cancellationsByPaymentStatus = buildCancellationByPaymentStatus(bookings)
  const averageDurationByAgency = buildAverageDurationByAgency(
    bookings.map((booking) => ({
      ...booking,
      supplierName: suppliersMap.get(booking.supplierId)?.name ?? booking.supplierName,
    })),
  )
  const conversionRate = computeConversionRate(acceptedBookings, views)
  const rebookingRate = calculateRebookingRate(bookings)
  const averageLeadTime = calculateAverageLeadTime(bookings)
  const topModels = buildTopModels(bookings).slice(0, 5)

  const currentYearStart = new Date(endDate.getFullYear(), 0, 1)
  const previousYearStart = new Date(endDate.getFullYear() - 1, 0, 1)
  const previousYearEnd = new Date(endDate.getFullYear() - 1, 11, 31, 23, 59, 59, 999)

  const [currentYearRevenue, previousYearRevenue] = await Promise.all([
    computeYearlyRevenue(currentYearStart, endDate),
    computeYearlyRevenue(previousYearStart, previousYearEnd),
  ])

  return {
    summary: {
      totalRevenue,
      totalBookings,
      activeAgencies: supplierIds.length,
      acceptanceRate,
      cancellationRate,
      occupancyRate,
      acceptedBookings,
      cancelledBookings,
      averageRevenuePerBooking,
      averageDuration,
      currentYearRevenue,
      previousYearRevenue,
      conversionRate,
      rebookingRate,
      averageLeadTime,
    },
    monthlyRevenue,
    weeklyTrend,
    statusBreakdown,
    revenueByStatus: statusBreakdown,
    revenueByModel: revenueByModel.slice(0, 5),
    occupancyByModel: occupancyByModel.slice(0, 5),
    cancellationsByPaymentStatus,
    averageDurationByAgency,
    viewsOverTime: buildViewsResponse(views),
    topModels,
  }
}

export const __private = {
  inclusiveDaysBetween,
  calculateBookedDays,
  calculateRebookingRate,
  calculateAverageLeadTime,
  buildRevenueSeries,
  buildModelRevenue,
  buildModelOccupancy,
  buildCancellationByPaymentStatus,
}
