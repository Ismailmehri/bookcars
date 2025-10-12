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

export const mergeBookingStats = (
  statsList: bookcarsTypes.BookingStat[][],
): bookcarsTypes.BookingStat[] => {
  const merged = new Map<bookcarsTypes.BookingStatus, { count: number; totalPrice: number }>()

  statsList.flat().forEach((stat) => {
    const status = stat.status
    const entry = merged.get(status) ?? { count: 0, totalPrice: 0 }

    merged.set(status, {
      count: entry.count + (stat.count ?? 0),
      totalPrice: entry.totalPrice + (stat.totalPrice ?? 0),
    })
  })

  return Array.from(merged.entries()).map(([status, value]) => ({
    status,
    count: value.count,
    totalPrice: value.totalPrice,
  }))
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
