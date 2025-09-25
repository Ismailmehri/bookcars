import * as bookcarsTypes from ':bookcars-types'
import * as env from '../config/env.config'
import * as helper from './helper'
import User from '../models/User'

type PopulatedBooking = (env.Booking & { supplier: env.User, driver: env.User }) | (bookcarsTypes.Booking & { supplier: bookcarsTypes.User, driver: bookcarsTypes.User })

const INCLUDED_STATUSES: bookcarsTypes.BookingStatus[] = [
  bookcarsTypes.BookingStatus.Pending,
  bookcarsTypes.BookingStatus.Deposit,
  bookcarsTypes.BookingStatus.Reserved,
  bookcarsTypes.BookingStatus.Paid,
]

const toParty = (party?: env.User | bookcarsTypes.User | null): bookcarsTypes.CommissionBookingParty => ({
  _id: party?._id ? party._id.toString() : '',
  fullName: party?.fullName || '',
  email: party?.email || undefined,
  phone: party?.phone || undefined,
})

const toNotificationInfo = (notification?: { count?: number, lastSent?: Date | string | null }): bookcarsTypes.CommissionNotificationInfo | undefined => {
  if (!notification) {
    return undefined
  }

  return {
    count: notification.count ?? 0,
    lastSent: notification.lastSent || null,
  }
}

export const computeCommissionAmount = (price?: number | null) => {
  const numericPrice = typeof price === 'number' ? price : 0
  const commission = numericPrice * env.COMMISSION_RATE
  return Number(commission.toFixed(2))
}

export const mapBookingToCommission = (booking: PopulatedBooking): bookcarsTypes.CommissionBooking => {
  const price = typeof booking.price === 'number' ? booking.price : 0
  const commission = computeCommissionAmount(price)

  return {
    bookingId: booking._id.toString(),
    supplier: toParty(booking.supplier as env.User),
    driver: toParty(booking.driver as env.User),
    from: new Date(booking.from),
    to: new Date(booking.to),
    createdAt: booking.createdAt ? new Date(booking.createdAt) : undefined,
    status: booking.status,
    price,
    commission,
    notifications: booking.notifications
      ? {
        supplier: toNotificationInfo(booking.notifications.supplier),
        client: toNotificationInfo(booking.notifications.client),
      }
      : undefined,
  }
}

export const summarizeCommissions = (bookings: bookcarsTypes.CommissionBooking[]): bookcarsTypes.CommissionSummary => {
  const accumulator = bookings.reduce((acc, booking) => {
    acc.totalAmount += booking.price
    acc.totalCommission += booking.commission

    if (booking.status === bookcarsTypes.BookingStatus.Paid) {
      acc.paidCommission += booking.commission
    }

    return acc
  }, {
    bookings: 0,
    totalAmount: 0,
    totalCommission: 0,
    paidCommission: 0,
  })

  const rounded = {
    bookings: bookings.length,
    totalAmount: Number(accumulator.totalAmount.toFixed(2)),
    totalCommission: Number(accumulator.totalCommission.toFixed(2)),
    paidCommission: Number(accumulator.paidCommission.toFixed(2)),
  }

  return {
    ...rounded,
    pendingCommission: Number((rounded.totalCommission - rounded.paidCommission).toFixed(2)),
  }
}

export const getIncludedStatuses = () => INCLUDED_STATUSES

export const filterAuthorizedSuppliers = async (userId: string, supplierIds?: string[]) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new Error('user not found')
  }

  const isAdmin = helper.admin(user)
  if (!isAdmin) {
    return [user._id?.toString() ?? '']
  }

  if (!supplierIds || supplierIds.length === 0) {
    return undefined
  }

  const unique = Array.from(new Set(supplierIds.filter((id) => helper.isValidObjectId(id))))
  return unique.length > 0 ? unique : undefined
}
