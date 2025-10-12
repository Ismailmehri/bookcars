import * as bookcarsTypes from ':bookcars-types'
import { strings } from '@/lang/insights'

export interface AgencyOption {
  id: string
  name: string
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

export const buildAgencyOptions = (
  suppliers: bookcarsTypes.SuppliersStat[],
  ranking: bookcarsTypes.AgencyRankingItem[],
): AgencyOption[] => {
  const options = new Map<string, string>()

  suppliers.forEach((supplier) => {
    if (supplier.supplierId && supplier.supplierName) {
      options.set(supplier.supplierId, supplier.supplierName)
    }
  })

  ranking.forEach((agency) => {
    if (agency.agencyId && agency.agencyName && !options.has(agency.agencyId)) {
      options.set(agency.agencyId, agency.agencyName)
    }
  })

  return Array.from(options.entries())
    .sort((a, b) => a[1].localeCompare(b[1], undefined, { sensitivity: 'base' }))
    .map(([id, name]) => ({ id, name }))
}

export const getStatusLabel = (status: bookcarsTypes.BookingStatus) => {
  switch (status) {
    case bookcarsTypes.BookingStatus.Paid:
      return strings.STATUS_PAID
    case bookcarsTypes.BookingStatus.Deposit:
      return strings.STATUS_DEPOSIT
    case bookcarsTypes.BookingStatus.Reserved:
      return strings.STATUS_RESERVED
    case bookcarsTypes.BookingStatus.Cancelled:
      return strings.STATUS_CANCELLED
    case bookcarsTypes.BookingStatus.Pending:
      return strings.STATUS_PENDING
    case bookcarsTypes.BookingStatus.Void:
      return strings.STATUS_VOID
    default:
      return status
  }
}

export const getCancellationPaymentLabel = (status: 'deposit' | 'paid') => {
  if (status === 'deposit') {
    return strings.CANCELLATION_PAYMENT_DEPOSIT
  }

  return strings.CANCELLATION_PAYMENT_PAID
}
