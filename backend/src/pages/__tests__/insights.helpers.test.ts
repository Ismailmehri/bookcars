import { describe, expect, it } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import {
  buildAgencyOptions,
  createAgencyOptionFromUser,
  getStatusLabel,
  getCancellationPaymentLabel,
} from '../insights.helpers'
import { strings } from '@/lang/insights'

describe('insights helpers (frontend)', () => {
  it('creates agency option from user when valid', () => {
    const user: bookcarsTypes.User = {
      _id: 'agency-1',
      fullName: 'Plany Cars',
      email: '',
      phone: '',
      type: bookcarsTypes.UserType.Supplier,
      language: 'fr',
      blacklisted: false,
    }

    expect(createAgencyOptionFromUser(user)).toEqual({ id: 'agency-1', name: 'Plany Cars' })
  })

  it('returns null for invalid users when building option', () => {
    expect(createAgencyOptionFromUser()).toBeNull()
    expect(createAgencyOptionFromUser({ fullName: '', _id: '', email: '', phone: '', type: bookcarsTypes.UserType.Supplier, language: 'fr', blacklisted: false })).toBeNull()
  })

  it('builds agency options without duplicates using suppliers then ranking', () => {
    const suppliers: bookcarsTypes.SuppliersStat[] = [
      { supplierId: '2', supplierName: 'Beta Cars' },
      { supplierId: '1', supplierName: 'Alpha Rentals' },
    ]

    const ranking: bookcarsTypes.AgencyRankingItem[] = [
      {
        agencyId: '3',
        agencyName: 'Gamma Mobility',
        score: 90,
        totalCars: 15,
        totalBookings: 120,
        acceptanceRate: 95,
        cancellationRate: 3,
        pendingUpdates: 0,
        revenue: 120000,
        reviewCount: 45,
        averageRating: 4.6,
      },
      {
        agencyId: '1',
        agencyName: 'Alpha Rentals',
        score: 80,
        totalCars: 10,
        totalBookings: 60,
        acceptanceRate: 92,
        cancellationRate: 5,
        pendingUpdates: 2,
        revenue: 80000,
        reviewCount: 20,
        averageRating: 4.2,
      },
    ]

    const options = buildAgencyOptions(suppliers, ranking)
    expect(options).toEqual([
      { id: '1', name: 'Alpha Rentals' },
      { id: '2', name: 'Beta Cars' },
      { id: '3', name: 'Gamma Mobility' },
    ])
  })

  it('returns localized status labels', () => {
    expect(getStatusLabel(bookcarsTypes.BookingStatus.Paid)).toBe(strings.STATUS_PAID)
    expect(getStatusLabel(bookcarsTypes.BookingStatus.Pending)).toBe(strings.STATUS_PENDING)
  })

  it('returns cancellation labels for payment status', () => {
    expect(getCancellationPaymentLabel('deposit')).toBe(strings.CANCELLATION_PAYMENT_DEPOSIT)
    expect(getCancellationPaymentLabel('paid')).toBe(strings.CANCELLATION_PAYMENT_PAID)
  })
})
