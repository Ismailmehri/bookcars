import { describe, expect, it } from '@jest/globals'
import * as bookcarsTypes from ':bookcars-types'
import { __private, type BookingMetricDocument } from '../statsService'

const createBooking = (overrides: Partial<BookingMetricDocument> = {}): BookingMetricDocument => ({
  status: bookcarsTypes.BookingStatus.Paid,
  price: 100,
  from: new Date('2024-01-10T00:00:00Z'),
  to: new Date('2024-01-12T00:00:00Z'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  supplierId: 'supplier-1',
  supplierName: 'Agency One',
  carId: 'car-1',
  carName: 'Model A',
  driverId: 'driver-1',
  paymentIntentId: 'pi_1',
  sessionId: 'sess_1',
  updatedAt: new Date('2024-01-12T00:00:00Z'),
  ...overrides,
})

describe('statsService helpers', () => {
  it('calculates inclusive days between dates', () => {
    const result = __private.inclusiveDaysBetween(
      new Date('2024-01-01T00:00:00Z'),
      new Date('2024-01-03T00:00:00Z'),
    )

    expect(result).toBe(3)
  })

  it('computes booked days within range', () => {
    const booking = createBooking({
      from: new Date('2024-02-01T00:00:00Z'),
      to: new Date('2024-02-05T00:00:00Z'),
    })

    const days = __private.calculateBookedDays(
      booking,
      new Date('2024-02-03T00:00:00Z'),
      new Date('2024-02-10T00:00:00Z'),
    )

    expect(days).toBe(3)
  })

  it('returns rebooking rate based on drivers with multiple accepted bookings', () => {
    const rate = __private.calculateRebookingRate([
      createBooking({ driverId: 'driver-1' }),
      createBooking({ driverId: 'driver-1', from: new Date('2024-02-01T00:00:00Z') }),
      createBooking({ driverId: 'driver-2' }),
      createBooking({ driverId: 'driver-3', status: bookcarsTypes.BookingStatus.Cancelled }),
    ])

    expect(rate).toBeCloseTo(1 / 3)
  })

  it('calculates average lead time using createdAt and from dates', () => {
    const lead = __private.calculateAverageLeadTime([
      createBooking({ from: new Date('2024-03-10T00:00:00Z'), createdAt: new Date('2024-03-01T00:00:00Z') }),
      createBooking({ from: new Date('2024-03-20T00:00:00Z'), createdAt: new Date('2024-03-05T00:00:00Z') }),
    ])

    expect(lead).toBeCloseTo(12.5)
  })

  it('aggregates revenue series by extractor key', () => {
    const series = __private.buildRevenueSeries(
      [
        createBooking({ from: new Date('2024-04-10T00:00:00Z'), price: 200 }),
        createBooking({ from: new Date('2024-04-15T00:00:00Z'), price: 50 }),
        createBooking({ from: new Date('2024-05-01T00:00:00Z'), price: 100 }),
      ],
      (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`,
    )

    expect(series).toEqual([
      { period: '2024-04', revenue: 250, bookings: 2 },
      { period: '2024-05', revenue: 100, bookings: 1 },
    ])
  })

  it('builds cancellation counts by payment status', () => {
    const summary = __private.buildCancellationByPaymentStatus([
      createBooking({ status: bookcarsTypes.BookingStatus.Cancelled, paymentIntentId: 'pi_2' }),
      createBooking({ status: bookcarsTypes.BookingStatus.Cancelled, paymentIntentId: null }),
      createBooking({ status: bookcarsTypes.BookingStatus.Paid }),
    ])

    expect(summary).toEqual([
      { paymentStatus: 'deposit', count: 1 },
      { paymentStatus: 'paid', count: 1 },
    ])
  })

  it('derives full-year bounds independent of selected range', () => {
    const reference = new Date('2024-06-15T12:00:00Z')

    const bounds = __private.getYearBounds(reference)

    expect(bounds.start.getFullYear()).toBe(2024)
    expect(bounds.start.getMonth()).toBe(0)
    expect(bounds.start.getDate()).toBe(1)
    expect(bounds.start.getHours()).toBe(0)
    expect(bounds.start.getMinutes()).toBe(0)
    expect(bounds.start.getSeconds()).toBe(0)
    expect(bounds.start.getMilliseconds()).toBe(0)

    expect(bounds.end.getFullYear()).toBe(2024)
    expect(bounds.end.getMonth()).toBe(11)
    expect(bounds.end.getDate()).toBe(31)
    expect(bounds.end.getHours()).toBe(23)
    expect(bounds.end.getMinutes()).toBe(59)
    expect(bounds.end.getSeconds()).toBe(59)
    expect(bounds.end.getMilliseconds()).toBe(999)
  })

  it('finds the latest booking activity date', () => {
    const latest = __private.findLastBookingActivity([
      createBooking({ from: new Date('2024-05-01T00:00:00Z'), to: new Date('2024-05-02T00:00:00Z') }),
      createBooking({
        from: new Date('2024-05-10T00:00:00Z'),
        to: new Date('2024-05-12T00:00:00Z'),
        updatedAt: new Date('2024-05-20T08:30:00Z'),
      }),
      createBooking({ from: new Date('2024-05-18T00:00:00Z'), to: new Date('2024-05-19T00:00:00Z') }),
    ])

    expect(latest?.toISOString()).toBe('2024-05-20T08:30:00.000Z')
  })
})
