import { describe, expect, it } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import {
  calculateOccupancyRate,
  countBookings,
  extractTotalRecords,
  getBookedDays,
  groupMonthlyRevenue,
  aggregateBookingsByStatus,
  sumBookingsRevenue,
  sumViewsByDate,
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

  it('extracts total records from various pageInfo shapes', () => {
    expect(extractTotalRecords({ totalRecords: 20 })).toBe(20)
    expect(extractTotalRecords([{ totalRecords: 10 }])).toBe(10)
    expect(extractTotalRecords(undefined)).toBe(0)
  })
})
