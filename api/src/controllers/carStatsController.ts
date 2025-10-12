import { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import Booking from '../models/Booking'
import { CarStats } from '../models/CarStats'
import User from '../models/User'
import Car from '../models/Car'
import * as helper from '../common/helper'
import * as authHelper from '../common/authHelper'

const ACCEPTED_STATUSES: bookcarsTypes.BookingStatus[] = [
  bookcarsTypes.BookingStatus.Paid,
  bookcarsTypes.BookingStatus.Reserved,
  bookcarsTypes.BookingStatus.Deposit,
]

const CANCELLED_STATUSES: bookcarsTypes.BookingStatus[] = [
  bookcarsTypes.BookingStatus.Cancelled,
  bookcarsTypes.BookingStatus.Void,
]

const PENDING_UPDATE_STATUSES: bookcarsTypes.BookingStatus[] = [
  bookcarsTypes.BookingStatus.Pending,
  bookcarsTypes.BookingStatus.Reserved,
  bookcarsTypes.BookingStatus.Deposit,
]

const roundTwoDecimals = (value: number) => Math.round(value * 100) / 100

const computeRate = (count: number, total: number) => (total === 0 ? 0 : Math.round((count / total) * 100))

const ensureObjectId = (value: string | undefined) => (value ? new mongoose.Types.ObjectId(value) : undefined)

type RawScoreBreakdown = ReturnType<typeof helper.calculateAgencyScore>

const normalizeScoreBreakdown = (raw: RawScoreBreakdown): bookcarsTypes.ScoreBreakdown => ({
  score: raw.total,
  details: raw.details,
  recommendations: raw.recommendations,
})

const unauthorizedResponse = (res: Response) => res.status(403).json({ message: 'Unauthorized' })

export const getCarStats = async (req: Request, res: Response) => {
  try {
    const { supplierId, carId } = req.params
    const { start, end } = req.query

    const startDate = start ? new Date(start as string) : new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    const endDate = end ? new Date(end as string) : new Date()

    const match: Record<string, unknown> = {
      supplier: new mongoose.Types.ObjectId(supplierId),
      viewedAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }

    if (carId) {
      match.car = new mongoose.Types.ObjectId(carId)
    }

    const stats = await CarStats.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } },
            car: '$car',
            supplier: '$supplier',
          },
          views: { $sum: 1 },
          payedViews: {
            $sum: {
              $cond: [{ $eq: ['$paidView', true] }, 1, 0],
            },
          },
          organiqueViews: {
            $sum: {
              $cond: [{ $eq: ['$paidView', false] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'Car',
          localField: '_id.car',
          foreignField: '_id',
          as: 'carDetails',
        },
      },
      { $unwind: '$carDetails' },
      {
        $project: {
          date: '$_id.date',
          views: 1,
          payedViews: 1,
          organiqueViews: 1,
          carName: '$carDetails.name',
          carId: '$carDetails._id',
        },
      },
      { $sort: { '_id.date': 1 } },
    ])

    return res.json(stats)
  } catch (err) {
    console.error('[carStats.getCarStats]', err)
    return res.status(500).json({ message: 'Error fetching stats' })
  }
}

export const getBookingStats = async (req: Request, res: Response) => {
  const { supplierId, carId } = req.params
  const { start, end } = req.query

  const startDate = start ? new Date(start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const endDate = end ? new Date(end as string) : new Date()

  const match: Record<string, unknown> = {
    supplier: new mongoose.Types.ObjectId(supplierId),
    createdAt: { $gte: startDate, $lte: endDate },
  }

  if (carId) {
    match.car = new mongoose.Types.ObjectId(carId)
  }

  const stats = await Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPrice: { $sum: '$price' },
      },
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        totalPrice: 1,
        _id: 0,
      },
    },
  ])

  return res.status(200).json(stats)
}

export const getBookingSummary = async (req: Request, res: Response) => {
  try {
    const { supplierId, carId } = req.params

    const match: Record<string, unknown> = {
      supplier: new mongoose.Types.ObjectId(supplierId),
      status: {
        $in: [
          bookcarsTypes.BookingStatus.Paid,
          bookcarsTypes.BookingStatus.Deposit,
          bookcarsTypes.BookingStatus.Reserved,
        ],
      },
    }

    if (carId) {
      match.car = new mongoose.Types.ObjectId(carId)
    }

    const stats = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: '$price' },
          paid: {
            $sum: {
              $cond: [{ $eq: ['$status', bookcarsTypes.BookingStatus.Paid] }, '$price', 0],
            },
          },
          deposit: {
            $sum: {
              $cond: [{ $eq: ['$status', bookcarsTypes.BookingStatus.Deposit] }, '$price', 0],
            },
          },
          reserved: {
            $sum: {
              $cond: [{ $eq: ['$status', bookcarsTypes.BookingStatus.Reserved] }, '$price', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          paid: 1,
          deposit: 1,
          reserved: 1,
        },
      },
    ])

    return res.status(200).json(stats[0] || { total: 0, paid: 0, deposit: 0, reserved: 0 })
  } catch (err) {
    console.error('[carStats.getBookingSummary]', err)
    return res.status(500).send(err)
  }
}

export const getUniqueSuppliers = async (req: Request, res: Response) => {
  try {
    const supplierIds = await CarStats.distinct('supplier')

    const suppliers = await User.find(
      { _id: { $in: supplierIds } },
      { _id: 1, fullName: 1 },
    ).sort({ fullName: 1 })

    const result = suppliers.map((supplier) => ({
      supplierId: supplier._id,
      supplierName: supplier.fullName,
    }))

    return res.json(result)
  } catch (err) {
    console.error('[carStats.getUniqueSuppliers]', err)
    return res.status(500).json({ message: 'Error fetching suppliers' })
  }
}

export const getAdminOverview = async (req: Request, res: Response) => {
  try {
    const session = await authHelper.getSessionData(req)
    const requester = await User.findById(session.id).lean()

    if (!requester || requester.type !== bookcarsTypes.UserType.Admin) {
      return unauthorizedResponse(res)
    }

    const agencies = await User.find({ type: bookcarsTypes.UserType.Supplier, blacklisted: false }).lean()

    if (agencies.length === 0) {
      return res.json({
        ranking: [],
        averagePrices: [],
        topModels: [],
        inactiveAgencies: [],
        summary: { totalAgencies: 0, totalCars: 0, averageScore: 0 },
        highlights: { topPerformers: [], watchList: [] },
      } satisfies bookcarsTypes.AdminStatisticsOverview)
    }

    const agencyIds = agencies.map((agency) => agency._id)

    const [rawBookings, rawCars, averagePrices, topModels] = await Promise.all([
      Booking.find({ supplier: { $in: agencyIds } }).lean(),
      Car.find({ supplier: { $in: agencyIds } }).lean(),
      Car.aggregate([
        { $match: { supplier: { $in: agencyIds } } },
        {
          $group: {
            _id: '$range',
            averageDailyPrice: { $avg: '$dailyPrice' },
            monthlyPriceSum: {
              $sum: {
                $cond: [{ $and: [{ $ne: ['$monthlyPrice', null] }, { $ne: ['$monthlyPrice', undefined] }] }, '$monthlyPrice', 0],
              },
            },
            monthlyPriceCount: {
              $sum: {
                $cond: [{ $and: [{ $ne: ['$monthlyPrice', null] }, { $ne: ['$monthlyPrice', undefined] }] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            averageDailyPrice: { $round: ['$averageDailyPrice', 0] },
            averageMonthlyPrice: {
              $cond: [
                { $eq: ['$monthlyPriceCount', 0] },
                null,
                {
                  $round: [
                    { $divide: ['$monthlyPriceSum', '$monthlyPriceCount'] },
                    0,
                  ],
                },
              ],
            },
          },
        },
        { $sort: { averageDailyPrice: -1 } },
      ]),
      Booking.aggregate([
        { $match: { supplier: { $in: agencyIds } } },
        {
          $lookup: {
            from: 'Car',
            localField: 'car',
            foreignField: '_id',
            as: 'carInfo',
          },
        },
        { $unwind: '$carInfo' },
        {
          $group: {
            _id: { carName: '$carInfo.name', supplier: '$supplier' },
            bookings: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'User',
            localField: '_id.supplier',
            foreignField: '_id',
            as: 'supplierInfo',
          },
        },
        { $unwind: { path: '$supplierInfo', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            model: '$_id.carName',
            bookings: 1,
            agencyId: '$_id.supplier',
            agencyName: '$supplierInfo.fullName',
          },
        },
        { $sort: { bookings: -1 } },
        { $limit: 10 },
      ]),
    ])

    const now = new Date()
    const bookingMetrics = new Map<string, {
      total: number
      accepted: number
      cancelled: number
      pendingUpdates: number
      revenue: number
      lastBookingAt?: Date
    }>()
    const bookingsByAgency = new Map<string, bookcarsTypes.Booking[]>()
    const carsByAgency = new Map<string, bookcarsTypes.Car[]>()

    rawBookings.forEach((bookingDoc) => {
      const supplierId = bookingDoc.supplier.toString()
      const metrics = bookingMetrics.get(supplierId) || {
        total: 0,
        accepted: 0,
        cancelled: 0,
        pendingUpdates: 0,
        revenue: 0,
        lastBookingAt: undefined,
      }

      metrics.total += 1

      if (ACCEPTED_STATUSES.includes(bookingDoc.status as bookcarsTypes.BookingStatus)) {
        metrics.accepted += 1
      }

      if (CANCELLED_STATUSES.includes(bookingDoc.status as bookcarsTypes.BookingStatus)) {
        metrics.cancelled += 1
      }

      if (
        bookingDoc.to
        && bookingDoc.to < now
        && PENDING_UPDATE_STATUSES.includes(bookingDoc.status as bookcarsTypes.BookingStatus)
      ) {
        metrics.pendingUpdates += 1
      }

      if (ACCEPTED_STATUSES.includes(bookingDoc.status as bookcarsTypes.BookingStatus)) {
        const bookingPrice = typeof (bookingDoc as { price?: number }).price === 'number'
          ? (bookingDoc as { price: number }).price
          : 0
        metrics.revenue += bookingPrice
      }

      const lastActivity = (
        'updatedAt' in bookingDoc ? (bookingDoc as { updatedAt?: Date }).updatedAt : undefined
      ) || bookingDoc.to || bookingDoc.from
      if (!metrics.lastBookingAt || (lastActivity && lastActivity > metrics.lastBookingAt)) {
        metrics.lastBookingAt = lastActivity
      }

      bookingMetrics.set(supplierId, metrics)

      const normalizedBooking: bookcarsTypes.Booking = {
        ...(bookingDoc as unknown as bookcarsTypes.Booking),
        supplier: supplierId,
        car: bookingDoc.car.toString(),
      }

      const bookings = bookingsByAgency.get(supplierId)
      if (bookings) {
        bookings.push(normalizedBooking)
      } else {
        bookingsByAgency.set(supplierId, [normalizedBooking])
      }
    })

    const agencyMap = new Map<string, bookcarsTypes.User>()
    agencies.forEach((agency) => {
      agencyMap.set(agency._id.toString(), agency as unknown as bookcarsTypes.User)
    })

    rawCars.forEach((carDoc) => {
      const supplierId = carDoc.supplier.toString()
      const normalizedCar: bookcarsTypes.Car = {
        ...(carDoc as unknown as bookcarsTypes.Car),
        supplier: agencyMap.get(supplierId) ?? ({} as bookcarsTypes.User),
      }

      const cars = carsByAgency.get(supplierId)
      if (cars) {
        cars.push(normalizedCar)
      } else {
        carsByAgency.set(supplierId, [normalizedCar])
      }
    })

    const ranking = agencies.map((agency) => {
      const supplierId = agency._id.toString()
      const agencyBookings = bookingsByAgency.get(supplierId) || []
      const agencyCars = carsByAgency.get(supplierId) || []
      const metrics = bookingMetrics.get(supplierId) || {
        total: 0,
        accepted: 0,
        cancelled: 0,
        pendingUpdates: 0,
        revenue: 0,
        lastBookingAt: undefined,
      }

      const reviews = Array.isArray((agency as { reviews?: { rating?: number }[] }).reviews)
        ? (agency as { reviews: { rating?: number }[] }).reviews
        : []
      const reviewCount = reviews.length
      const averageRating = reviewCount === 0
        ? null
        : roundTwoDecimals(
          reviews.reduce((acc, review) => acc + (review.rating ?? 0), 0) / reviewCount,
        )

      const lastConnectionAt = (agency as { updatedAt?: Date }).updatedAt

      const scoreBreakdown = helper.calculateAgencyScore(
        agency as unknown as bookcarsTypes.User,
        agencyBookings,
        agencyCars,
      )

      return {
        agencyId: supplierId,
        agencyName: agency.fullName,
        score: scoreBreakdown.total,
        totalCars: agencyCars.length,
        totalBookings: metrics.total,
        acceptanceRate: computeRate(metrics.accepted, metrics.total),
        cancellationRate: computeRate(metrics.cancelled, metrics.total),
        pendingUpdates: metrics.pendingUpdates,
        revenue: roundTwoDecimals(metrics.revenue),
        lastConnectionAt,
        reviewCount,
        averageRating,
        lastBookingAt: metrics.lastBookingAt,
      } satisfies bookcarsTypes.AgencyRankingItem
    })

    ranking.sort((a, b) => b.score - a.score)

    const totalCars = ranking.reduce((acc, item) => acc + item.totalCars, 0)
    const averageScore = ranking.length === 0
      ? 0
      : roundTwoDecimals(ranking.reduce((acc, item) => acc + item.score, 0) / ranking.length)

    const inactiveAgencies = ranking
      .filter((item) => item.pendingUpdates > 0)
      .map((item) => ({
        agencyId: item.agencyId,
        agencyName: item.agencyName,
        pendingUpdates: item.pendingUpdates,
        score: item.score,
        lastActivity: item.lastBookingAt,
        lastConnectionAt: item.lastConnectionAt,
      }))

    const HIGH_SCORE_THRESHOLD = 80
    const WATCH_SCORE_THRESHOLD = 50
    const LOW_ACTIVITY_THRESHOLD = 3

    const topPerformers = ranking.filter((item) => item.score >= HIGH_SCORE_THRESHOLD).slice(0, 3)

    const watchList = ranking
      .filter((item) => (
        item.score < WATCH_SCORE_THRESHOLD
        || item.pendingUpdates > 0
        || item.totalBookings < LOW_ACTIVITY_THRESHOLD
      ))
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)

    const normalizedTopModels = topModels.map((item) => ({
      model: item.model,
      bookings: item.bookings,
      agencyId: item.agencyId?.toString(),
      agencyName: item.agencyName,
    }))

    return res.json({
      ranking,
      averagePrices: averagePrices.map((price) => ({
        category: price.category as bookcarsTypes.CarRange,
        averageDailyPrice: price.averageDailyPrice ?? 0,
        averageMonthlyPrice: price.averageMonthlyPrice ?? null,
      })),
      topModels: normalizedTopModels,
      inactiveAgencies,
      summary: {
        totalAgencies: ranking.length,
        totalCars,
        averageScore,
      },
      highlights: {
        topPerformers,
        watchList,
      },
    } satisfies bookcarsTypes.AdminStatisticsOverview)
  } catch (err) {
    console.error('[carStats.getAdminOverview]', err)
    return res.status(500).json({ message: 'Error computing admin statistics' })
  }
}

export const getAgencyOverview = async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params

    const session = await authHelper.getSessionData(req)
    const requester = await User.findById(session.id).lean()

    if (!requester) {
      return unauthorizedResponse(res)
    }

    const isAdmin = requester.type === bookcarsTypes.UserType.Admin
    const isSelf = requester._id?.toString() === supplierId

    if (!isAdmin && !isSelf) {
      return unauthorizedResponse(res)
    }

    const agency = await User.findById(supplierId).lean()
    if (!agency || agency.type !== bookcarsTypes.UserType.Supplier) {
      return res.status(404).json({ message: 'Agency not found' })
    }

    const [rawBookings, rawCars] = await Promise.all([
      Booking.find({ supplier: ensureObjectId(supplierId) }).lean(),
      Car.find({ supplier: ensureObjectId(supplierId) }).lean(),
    ])

    const bookings: bookcarsTypes.Booking[] = rawBookings.map((booking) => ({
      ...(booking as unknown as bookcarsTypes.Booking),
      supplier: supplierId,
      car: booking.car.toString(),
    }))

    const cars: bookcarsTypes.Car[] = rawCars.map((car) => ({
      ...(car as unknown as bookcarsTypes.Car),
      supplier: agency as unknown as bookcarsTypes.User,
    }))

    const scoreBreakdown = normalizeScoreBreakdown(
      helper.calculateAgencyScore(agency as unknown as bookcarsTypes.User, bookings, cars),
    )

    const metrics = bookings.reduce((acc, booking) => {
      acc.total += 1
      if (ACCEPTED_STATUSES.includes(booking.status)) {
        acc.accepted += 1
        const price = typeof booking.price === 'number' ? booking.price : 0
        acc.revenue += price
      }
      if (CANCELLED_STATUSES.includes(booking.status)) {
        acc.cancelled += 1
      }

      if (
        booking.to
        && new Date(booking.to) < new Date()
        && PENDING_UPDATE_STATUSES.includes(booking.status)
      ) {
        acc.pending.push(booking)
      }

      const lastActivity = (
        'updatedAt' in booking ? (booking as { updatedAt?: Date }).updatedAt : undefined
      ) || booking.to || booking.from
      if (!acc.lastBookingAt || (lastActivity && lastActivity > acc.lastBookingAt)) {
        acc.lastBookingAt = lastActivity
      }

      return acc
    }, {
      total: 0,
      accepted: 0,
      cancelled: 0,
      revenue: 0,
      pending: [] as bookcarsTypes.Booking[],
      lastBookingAt: undefined as Date | undefined,
    })

    const categoryAverages = await Car.aggregate([
      { $match: { supplier: new mongoose.Types.ObjectId(supplierId) } },
      {
        $group: {
          _id: '$range',
          averageDailyPrice: { $avg: '$dailyPrice' },
          monthlyPriceSum: {
            $sum: {
              $cond: [{ $and: [{ $ne: ['$monthlyPrice', null] }, { $ne: ['$monthlyPrice', undefined] }] }, '$monthlyPrice', 0],
            },
          },
          monthlyPriceCount: {
            $sum: {
              $cond: [{ $and: [{ $ne: ['$monthlyPrice', null] }, { $ne: ['$monthlyPrice', undefined] }] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          averageDailyPrice: { $round: ['$averageDailyPrice', 0] },
          averageMonthlyPrice: {
            $cond: [
              { $eq: ['$monthlyPriceCount', 0] },
              null,
              {
                $round: [
                  { $divide: ['$monthlyPriceSum', '$monthlyPriceCount'] },
                  0,
                ],
              },
            ],
          },
        },
      },
      { $sort: { averageDailyPrice: -1 } },
    ])

    const carNameMap = new Map<string, string>()
    rawCars.forEach((car) => {
      carNameMap.set(car._id.toString(), car.name)
    })

    const topModelMap = new Map<string, number>()
    bookings.forEach((booking) => {
      const name = carNameMap.get((booking.car as string))
      if (!name) {
        return
      }
      const current = topModelMap.get(name) || 0
      topModelMap.set(name, current + 1)
    })

    const topModels = Array.from(topModelMap.entries())
      .map(([model, count]) => ({ model, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)

    const pendingUpdates = metrics.pending
      .map((booking) => ({
        bookingId: booking._id as string,
        carName: carNameMap.get(booking.car as string) || '—',
        status: booking.status,
        endDate: booking.to.toString(),
        overdueDays: Math.max(
          0,
          Math.floor((Date.now() - new Date(booking.to).getTime()) / (1000 * 60 * 60 * 24)),
        ),
      }))
      .sort((a, b) => b.overdueDays - a.overdueDays)
      .slice(0, 10)

    const lastConnectionAt = (agency as { updatedAt?: Date }).updatedAt

    return res.json({
      score: scoreBreakdown,
      totalBookings: metrics.total,
      acceptanceRate: computeRate(metrics.accepted, metrics.total),
      cancellationRate: computeRate(metrics.cancelled, metrics.total),
      totalCars: cars.length,
      totalRevenue: roundTwoDecimals(metrics.revenue),
      lastBookingAt: metrics.lastBookingAt,
      lastConnectionAt,
      averagePrices: categoryAverages.map((item) => ({
        category: item.category as bookcarsTypes.CarRange,
        averageDailyPrice: item.averageDailyPrice ?? 0,
        averageMonthlyPrice: item.averageMonthlyPrice ?? null,
      })),
      pendingUpdateCount: metrics.pending.length,
      pendingUpdates,
      topModels,
    } satisfies bookcarsTypes.AgencyStatisticsOverview)
  } catch (err) {
    console.error('[carStats.getAgencyOverview]', err)
    return res.status(500).json({ message: 'Error computing agency statistics' })
  }
}
