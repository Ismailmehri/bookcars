import { jest } from '@jest/globals'
import mongoose from 'mongoose'
import nodemailer from 'nodemailer'
import * as env from '../src/config/env.config'
import Car from '../src/models/Car'
import Location from '../src/models/Location'
import { confirm } from '../src/controllers/bookingController'

describe('bookingController confirm', () => {
  let transportSendMail: jest.MockedFunction<(options: unknown, callback: (err: Error | null, info: unknown) => void) => void>

  const booking = {
    _id: 'booking-123',
    car: 'car-1',
    pickupLocation: 'location-1',
    dropOffLocation: 'location-2',
    from: new Date('2024-05-01T10:00:00Z'),
    to: new Date('2024-05-05T10:00:00Z'),
    price: 0,
    commissionRate: 0,
    commissionTotal: 0,
  } as unknown as env.Booking

  const user = {
    _id: 'user-1',
    email: 'user@example.com',
    fullName: 'Customer',
    language: 'fr',
  } as unknown as env.User

  const supplier = {
    _id: 'supplier-1',
    fullName: 'Supplier',
    email: 'supplier@example.com',
    contracts: [],
    phone: '+21611111111',
    language: 'fr',
  } as unknown as env.User

  beforeEach(() => {
    transportSendMail = jest.fn<(options: unknown, callback: (err: Error | null, info: unknown) => void) => void>((options, callback) => {
      callback(null, {})
    })
    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: transportSendMail as unknown as nodemailer.Transporter['sendMail'],
    } as nodemailer.Transporter)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('should return false when the car is missing', async () => {
    const populateMock = jest.fn(() => Promise.resolve(null as unknown))
    jest.spyOn(Car, 'findById').mockReturnValue({
      populate: populateMock,
    } as unknown as ReturnType<typeof Car.findById>)

    const result = await confirm(user, supplier, booking, true)

    expect(result).toBe(false)
    expect(transportSendMail).not.toHaveBeenCalled()
  })

  it('should send a confirmation email with localized locations', async () => {
    const populatedCar = {
      supplier: {
        fullName: 'Supplier Company',
        phone: '+21622222222',
      },
      name: 'Peugeot 208',
    }

    const populateCarMock = jest.fn(() => Promise.resolve(populatedCar as unknown))
    jest.spyOn(Car, 'findById').mockReturnValue({
      populate: populateCarMock,
    } as unknown as ReturnType<typeof Car.findById>)

    const pickupLocationDoc = {
      values: [
        { language: 'fr', value: 'Aéroport Tunis' },
        { language: 'en', value: 'Tunis Airport' },
      ],
    }
    const dropOffLocationDoc = {
      values: [
        { language: 'fr', value: 'Centre-ville Tunis' },
        { language: 'en', value: 'Downtown Tunis' },
      ],
    }

    const pickupLocationId = String(booking.pickupLocation)
    jest.spyOn(Location, 'findById').mockImplementation((...args: unknown[]) => {
      const [rawId] = args as [mongoose.Types.ObjectId | string]
      const id = typeof rawId === 'string' ? rawId : rawId.toString()
      const populateLocationMock = jest.fn(() => Promise.resolve(
        id === pickupLocationId ? pickupLocationDoc : dropOffLocationDoc,
      ))
      return {
        populate: populateLocationMock,
      } as unknown as ReturnType<typeof Location.findById>
    })

    const result = await confirm(user, supplier, booking, true)

    expect(result).toBe(true)
    expect(transportSendMail).toHaveBeenCalledTimes(1)
    const mailOptions = transportSendMail.mock.calls[0][0] as { to: string, subject: string, html: string, attachments?: unknown }
    expect(mailOptions.to).toBe(user.email)
    expect(mailOptions.subject).toContain(booking._id)
    expect(mailOptions.html).toContain('Aéroport Tunis')
    expect(mailOptions.html).toContain('Centre-ville Tunis')
    expect(mailOptions.attachments).toBeUndefined()
  })
})
