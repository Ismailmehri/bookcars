import { describe, expect, it } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import {
  calculateOccupancyRate,
  countBookings,
  extractTotalRecords,
  getBookedDays,
  groupMonthlyRevenue,
  aggregateBookingsByStatus,
  buildAgencyOptions,
  createAgencyOptionFromUser,
  sumBookingsRevenue,
  sumViewsByDate,
  getBookingDurationInDays,
  calculateAverageDuration,
  groupAverageDurationByAgency,
  calculateViewsToBookingsConversion,
} from '../insights.helpers'

describe('insights helpers', () => {
  const booking = (from: string, to: string, price = 100): bookcarsTypes.Booking => ({
    from: new Date(from),
    to: new Date(to),
    price,
    status: bookcarsTypes.BookingStatus.Paid,
    supplier: '',
    car: '',
    pickupLocation: '',
    dropOffLocation: '',
  })

  it('computes booked days within range', () => {
    const bookings = [booking('2024-01-05', '2024-01-10'), booking('2024-01-08', '2024-01-12')]
    const booked = getBookedDays(bookings, new Date('2024-01-01'), new Date('2024-01-31'))
    expect(booked).toBe(11)
  })

  it('computes occupancy rate clamped between 0 and 1', () => {
    const bookings = [booking('2024-02-01', '2024-02-05')]
    const occupancy = calculateOccupancyRate(bookings, 2, new Date('2024-02-01'), new Date('2024-02-29'))
    expect(occupancy).toBeCloseTo(5 / (29 * 2))
  })

  it('groups monthly revenue', () => {
    const bookings = [
      booking('2024-03-02', '2024-03-05', 200),
      booking('2024-03-15', '2024-03-20', 150),
      booking('2024-04-01', '2024-04-03', 100),
    ]
    const grouped = groupMonthlyRevenue(bookings, new Date('2024-03-01'), new Date('2024-04-30'))
    expect(grouped).toEqual([
      { month: '2024-03', total: 350 },
      { month: '2024-04', total: 100 },
    ])
  })

  it('aggregates views by date', () => {
    const stats: bookcarsTypes.CarStat[] = [
      {
        _id: { date: '2024-05-01', car: '1' },
        date: '2024-05-01',
        views: 10,
        payedViews: 4,
        organiqueViews: 6,
        carName: 'Car A',
        carId: '1',
        supplierId: 'sup1',
        supplierName: 'Agency 1',
      },
      {
        _id: { date: '2024-05-01', car: '2' },
        date: '2024-05-01',
        views: 5,
        payedViews: 1,
        organiqueViews: 4,
        carName: 'Car B',
        carId: '2',
        supplierId: 'sup1',
        supplierName: 'Agency 1',
      },
      {
        _id: { date: '2024-05-02', car: '1' },
        date: '2024-05-02',
        views: 8,
        payedViews: 3,
        organiqueViews: 5,
        carName: 'Car A',
        carId: '1',
        supplierId: 'sup1',
        supplierName: 'Agency 1',
      },
    ]

    const aggregated = sumViewsByDate(stats)
    expect(aggregated).toEqual([
      { date: '2024-05-01', organique: 10, paid: 5, total: 15 },
      { date: '2024-05-02', organique: 5, paid: 3, total: 8 },
    ])
  })

  it('aggregates bookings by status', () => {
    const bookings: bookcarsTypes.Booking[] = [
      { ...booking('2024-01-01', '2024-01-02', 200), status: bookcarsTypes.BookingStatus.Paid },
      { ...booking('2024-01-03', '2024-01-04', 150), status: bookcarsTypes.BookingStatus.Paid },
      { ...booking('2024-01-05', '2024-01-06', 50), status: bookcarsTypes.BookingStatus.Cancelled },
    ]

    const aggregated = aggregateBookingsByStatus(bookings)

    expect(aggregated).toContainEqual({
      status: bookcarsTypes.BookingStatus.Paid,
      count: 2,
      totalPrice: 350,
    })

    expect(aggregated).toContainEqual({
      status: bookcarsTypes.BookingStatus.Cancelled,
      count: 1,
      totalPrice: 50,
    })
  })

  it('sums booking revenue and counts bookings', () => {
    const bookings = [booking('2024-01-01', '2024-01-02', 100), booking('2024-01-05', '2024-01-06', 200)]
    expect(sumBookingsRevenue(bookings)).toBe(300)
    expect(countBookings(bookings)).toBe(2)
  })

  it('computes booking duration in days safely', () => {
    expect(getBookingDurationInDays(booking('2024-06-01', '2024-06-05'))).toBe(5)
    expect(getBookingDurationInDays({ ...booking('2024-06-01', '2024-06-05'), from: undefined })).toBe(0)
  })

  it('calculates average duration across bookings', () => {
    const bookings = [booking('2024-07-01', '2024-07-03'), booking('2024-07-10', '2024-07-15')]
    expect(calculateAverageDuration(bookings)).toBeCloseTo((3 + 6) / 2)
  })

  it('groups average duration by agency preserving ranking names', () => {
    const agencyBookings: bookcarsTypes.Booking[] = [
      { ...booking('2024-08-01', '2024-08-05'), supplier: 'agency-1' },
      { ...booking('2024-08-10', '2024-08-12'), supplier: 'agency-1' },
      { ...booking('2024-08-15', '2024-08-18'), supplier: 'agency-2' },
    ]

    const ranking: bookcarsTypes.AgencyRankingItem[] = [
      {
        agencyId: 'agency-1',
        agencyName: 'Agency One',
        score: 90,
        totalCars: 10,
        totalBookings: 100,
        acceptanceRate: 95,
        cancellationRate: 3,
        pendingUpdates: 1,
        revenue: 100000,
        reviewCount: 20,
        averageRating: 4.5,
      },
      {
        agencyId: 'agency-2',
        agencyName: 'Agency Two',
        score: 80,
        totalCars: 5,
        totalBookings: 40,
        acceptanceRate: 90,
        cancellationRate: 5,
        pendingUpdates: 0,
        revenue: 60000,
        reviewCount: 10,
        averageRating: 4.2,
      },
    ]

    const grouped = groupAverageDurationByAgency(agencyBookings, ranking)

    expect(grouped).toHaveLength(2)
    expect(grouped).toEqual(
      expect.arrayContaining([
        { agencyId: 'agency-2', agencyName: 'Agency Two', averageDuration: 4 },
        { agencyId: 'agency-1', agencyName: 'Agency One', averageDuration: 4 },
      ]),
    )
  })

  it('computes views to bookings conversion ratio', () => {
    expect(calculateViewsToBookingsConversion(10, 100)).toBe(0.1)
    expect(calculateViewsToBookingsConversion(5, 0)).toBe(0)
  })

  it('builds agency options from suppliers and ranking without duplicates', () => {
    const suppliers: bookcarsTypes.SuppliersStat[] = [
      { supplierId: '2', supplierName: 'Beta Cars' },
      { supplierId: '1', supplierName: 'Alpha Rentals' },
    ]

    const ranking: bookcarsTypes.AgencyRankingItem[] = [
      {
        agencyId: '3',
        agencyName: 'Gamma Mobility',
        score: 90,
        totalCars: 12,
        totalBookings: 150,
        acceptanceRate: 0.95,
        cancellationRate: 0.03,
        pendingUpdates: 1,
        revenue: 200000,
        reviewCount: 20,
        averageRating: 4.7,
      },
      {
        agencyId: '2',
        agencyName: 'Beta Cars',
        score: 80,
        totalCars: 10,
        totalBookings: 120,
        acceptanceRate: 0.9,
        cancellationRate: 0.05,
        pendingUpdates: 2,
        revenue: 150000,
        reviewCount: 15,
        averageRating: 4.5,
      },
    ]

    const options = buildAgencyOptions(suppliers, ranking)

    expect(options).toEqual([
      { id: '1', name: 'Alpha Rentals' },
      { id: '2', name: 'Beta Cars' },
      { id: '3', name: 'Gamma Mobility' },
    ])
  })

  it('creates agency option from user when id and name exist', () => {
    const option = createAgencyOptionFromUser({
      _id: 'agency-1',
      fullName: 'Agency One',
    } as bookcarsTypes.User)

    expect(option).toEqual({ id: 'agency-1', name: 'Agency One' })
  })

  it('returns null when user is missing id or name', () => {
    expect(createAgencyOptionFromUser(undefined)).toBeNull()
    expect(
      createAgencyOptionFromUser({
        _id: '',
        fullName: ' ',
      } as bookcarsTypes.User),
    ).toBeNull()
  })

  it('extracts total records from various pageInfo shapes', () => {
    expect(extractTotalRecords({ totalRecords: 20 })).toBe(20)
    expect(extractTotalRecords([{ totalRecords: 10 }])).toBe(10)
    expect(extractTotalRecords(undefined)).toBe(0)
  })
})
