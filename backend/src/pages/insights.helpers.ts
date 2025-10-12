import { differenceInCalendarDays, max, min } from 'date-fns'
import * as bookcarsTypes from ':bookcars-types'

export interface MonthlyRevenuePoint {
  month: string
  total: number
}

export interface ViewsTimePoint {
  date: string
  organique: number
  paid: number
  total: number
}

export interface AgencyOption {
  id: string
  name: string
}

export interface AgencyAverageDurationPoint {
  agencyId: string
  agencyName: string
  averageDuration: number
}

export const createAgencyOptionFromUser = (user?: bookcarsTypes.User): AgencyOption | null => {
  if (!user || !user._id) {
    return null
  }

  const name = (user.fullName || '').trim()

  if (!name) {
    return null
  }

  return {
    id: user._id,
    name,
  }
}

export const clampDateToRange = (value: Date, start: Date, end: Date) => {
  if (value.getTime() < start.getTime()) {
    return start
  }

  if (value.getTime() > end.getTime()) {
    return end
  }

  return value
}

export const getBookedDays = (
  bookings: bookcarsTypes.Booking[],
  rangeStart: Date,
  rangeEnd: Date,
) => {
  if (bookings.length === 0) {
    return 0
  }

  return bookings.reduce((total, booking) => {
    if (!booking.from || !booking.to) {
      return total
    }

    const bookingStart = new Date(booking.from)
    const bookingEnd = new Date(booking.to)

    const clampedStart = max([bookingStart, rangeStart])
    const clampedEnd = min([bookingEnd, rangeEnd])

    if (clampedEnd.getTime() < clampedStart.getTime()) {
      return total
    }

    return total + differenceInCalendarDays(clampedEnd, clampedStart) + 1
  }, 0)
}

export const calculateOccupancyRate = (
  bookings: bookcarsTypes.Booking[],
  totalCars: number,
  rangeStart: Date,
  rangeEnd: Date,
) => {
  if (totalCars <= 0) {
    return 0
  }

  const totalDays = differenceInCalendarDays(rangeEnd, rangeStart) + 1

  if (totalDays <= 0) {
    return 0
  }

  const bookedDays = getBookedDays(bookings, rangeStart, rangeEnd)
  const publishedDays = totalDays * totalCars

  if (publishedDays <= 0) {
    return 0
  }

  const occupancy = bookedDays / publishedDays

  if (!Number.isFinite(occupancy) || occupancy < 0) {
    return 0
  }

  return occupancy > 1 ? 1 : occupancy
}

export const groupMonthlyRevenue = (
  bookings: bookcarsTypes.Booking[],
  rangeStart: Date,
  rangeEnd: Date,
): MonthlyRevenuePoint[] => {
  const revenueMap = new Map<string, number>()

  bookings.forEach((booking) => {
    if (!booking.from) {
      return
    }

    const from = new Date(booking.from)
    const monthKey = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}`

    if (from.getTime() < rangeStart.getTime() || from.getTime() > rangeEnd.getTime()) {
      return
    }

    const price = booking.price ?? 0
    if (!Number.isFinite(price) || price <= 0) {
      return
    }

    const current = revenueMap.get(monthKey) ?? 0
    revenueMap.set(monthKey, current + price)
  })

  return Array.from(revenueMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))
}

export const sumViewsByDate = (stats: bookcarsTypes.CarStat[]): ViewsTimePoint[] => {
  const aggregations = stats.reduce<Map<string, { organique: number; paid: number; total: number }>>(
    (acc, item) => {
      const dateKey = item.date || item._id?.date || ''
      if (!dateKey) {
        return acc
      }

      const organique = item.organiqueViews ?? 0
      const paid = item.payedViews ?? 0
      const total = item.views ?? organique + paid

      const previous = acc.get(dateKey) ?? { organique: 0, paid: 0, total: 0 }
      acc.set(dateKey, {
        organique: previous.organique + organique,
        paid: previous.paid + paid,
        total: previous.total + total,
      })

      return acc
    },
    new Map(),
  )

  return Array.from(aggregations.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, values]) => ({ date, ...values }))
}

export const aggregateBookingsByStatus = (
  bookings: bookcarsTypes.Booking[],
): bookcarsTypes.BookingStat[] => {
  const accumulator = bookings.reduce<Map<bookcarsTypes.BookingStatus, { count: number; totalPrice: number }>>(
    (acc, current) => {
      const status = (current.status ?? bookcarsTypes.BookingStatus.Pending) as bookcarsTypes.BookingStatus
      const existing = acc.get(status) ?? { count: 0, totalPrice: 0 }

      const price = typeof current.price === 'number' && Number.isFinite(current.price) ? current.price : 0

      acc.set(status, {
        count: existing.count + 1,
        totalPrice: existing.totalPrice + price,
      })

      return acc
    },
    new Map(),
  )

  return Array.from(accumulator.entries()).map(([status, summary]) => ({
    status,
    count: summary.count,
    totalPrice: summary.totalPrice,
  }))
}

export const getBookingDurationInDays = (booking: bookcarsTypes.Booking): number => {
  if (!booking.from || !booking.to) {
    return 0
  }

  const from = new Date(booking.from)
  const to = new Date(booking.to)

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return 0
  }

  const diff = differenceInCalendarDays(to, from) + 1

  if (!Number.isFinite(diff) || diff <= 0) {
    return 0
  }

  return diff
}

export const calculateAverageDuration = (bookings: bookcarsTypes.Booking[]): number => {
  if (bookings.length === 0) {
    return 0
  }

  const { totalDuration, count } = bookings.reduce(
    (acc, booking) => {
      const duration = getBookingDurationInDays(booking)

      if (duration > 0) {
        acc.totalDuration += duration
        acc.count += 1
      }

      return acc
    },
    { totalDuration: 0, count: 0 },
  )

  if (count === 0) {
    return 0
  }

  return totalDuration / count
}

export const groupAverageDurationByAgency = (
  bookings: bookcarsTypes.Booking[],
  ranking: bookcarsTypes.AgencyRankingItem[],
): AgencyAverageDurationPoint[] => {
  if (bookings.length === 0) {
    return []
  }

  const rankingMap = new Map(ranking.map((item) => [item.agencyId, item.agencyName]))
  const accumulator = bookings.reduce<Map<string, { total: number; count: number }>>((acc, booking) => {
    const supplierId = typeof booking.supplier === 'string'
      ? booking.supplier
      : (booking.supplier as bookcarsTypes.User | undefined)?._id

    if (!supplierId) {
      return acc
    }

    const duration = getBookingDurationInDays(booking)

    if (duration <= 0) {
      return acc
    }

    const current = acc.get(supplierId) ?? { total: 0, count: 0 }
    acc.set(supplierId, {
      total: current.total + duration,
      count: current.count + 1,
    })

    return acc
  }, new Map())

  return Array.from(accumulator.entries())
    .map(([agencyId, { total, count }]) => ({
      agencyId,
      agencyName: rankingMap.get(agencyId) ?? agencyId,
      averageDuration: count === 0 ? 0 : total / count,
    }))
    .sort((a, b) => b.averageDuration - a.averageDuration)
}

export const buildAgencyOptions = (
  suppliers: bookcarsTypes.SuppliersStat[],
  ranking: bookcarsTypes.AgencyRankingItem[],
): AgencyOption[] => {
  const options = new Map<string, string>()

  suppliers.forEach((supplier) => {
    if (!supplier.supplierId || !supplier.supplierName) {
      return
    }

    options.set(supplier.supplierId, supplier.supplierName)
  })

  ranking.forEach((agency) => {
    if (!agency.agencyId || !agency.agencyName) {
      return
    }

    if (!options.has(agency.agencyId)) {
      options.set(agency.agencyId, agency.agencyName)
    }
  })

  return Array.from(options.entries())
    .sort((a, b) => a[1].localeCompare(b[1], undefined, { sensitivity: 'base' }))
    .map(([id, name]) => ({ id, name }))
}

export const sumBookingsRevenue = (bookings: bookcarsTypes.Booking[]) =>
  bookings.reduce((total, booking) => {
    const price = booking.price ?? 0
    if (!Number.isFinite(price) || price <= 0) {
      return total
    }

    return total + price
  }, 0)

export const countBookings = (bookings: bookcarsTypes.Booking[]) => bookings.length

export const extractTotalRecords = (pageInfo: unknown): number => {
  if (!pageInfo) {
    return 0
  }

  if (Array.isArray(pageInfo)) {
    const item = pageInfo[0] as { totalRecords?: number } | undefined
    return typeof item?.totalRecords === 'number' ? item.totalRecords : 0
  }

  if (typeof pageInfo === 'object' && 'totalRecords' in (pageInfo as Record<string, unknown>)) {
    const value = (pageInfo as { totalRecords?: number }).totalRecords
    return typeof value === 'number' ? value : 0
  }

  return 0
}

export const calculateViewsToBookingsConversion = (accepted: number, totalViews: number): number => {
  if (totalViews <= 0) {
    return 0
  }

  return accepted / totalViews
}
