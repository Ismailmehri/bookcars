import path from 'node:path'
import { jest } from '@jest/globals'

describe('bookingController notify', () => {
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('increments an existing notification counter and emails the recipient', async () => {
    const notificationSave = jest.fn(async () => undefined)
    const NotificationMock = jest.fn().mockImplementation((doc: any) => ({ ...(doc || {}), save: notificationSave }))

    const counterSave = jest.fn(async () => undefined)
    const counterDoc = { count: 1, save: counterSave }
    const findOneMock = jest.fn(async () => counterDoc)
    const NotificationCounterMock: any = jest.fn().mockImplementation((doc: any) => ({ ...(doc || {}), save: counterSave }))
    NotificationCounterMock.findOne = findOneMock

    const sendMailMock = jest.fn(async () => undefined)
    const joinURLMock = jest.fn(() => 'https://backend/update-booking')

    const i18nMock = { locale: 'en', t: jest.fn((key: string) => key) }
    const loggerMock = { error: jest.fn(), info: jest.fn() }

    jest.unstable_mockModule('../src/models/Notification', () => ({
      __esModule: true,
      default: NotificationMock,
    }))
    jest.unstable_mockModule('../src/models/NotificationCounter', () => ({
      __esModule: true,
      default: NotificationCounterMock,
    }))
    jest.unstable_mockModule('../src/common/mailHelper', () => ({
      __esModule: true,
      sendMail: sendMailMock,
    }))
    jest.unstable_mockModule('../src/common/helper', () => ({
      __esModule: true,
      joinURL: joinURLMock,
      exists: jest.fn(),
      generateToken: jest.fn(),
      StringToBoolean: (input: string) => input === 'true',
    }))
    jest.unstable_mockModule('../src/lang/i18n', () => ({
      __esModule: true,
      default: i18nMock,
    }))
    jest.unstable_mockModule('../src/common/logger', () => ({
      __esModule: true,
      ...loggerMock,
    }))

    const bookingController = await import('../src/controllers/bookingController')

    const driver = { fullName: 'Driver Smith' } as any
    const recipient = {
      _id: 'user-1',
      language: 'en',
      enableEmailNotifications: true,
      email: 'user@example.com',
      fullName: 'User One',
    } as any

    await bookingController.notify(driver, 'booking-42', recipient, 'updated booking')

    expect(NotificationMock).toHaveBeenCalledWith({
      user: recipient._id,
      message: 'Driver Smith updated booking booking-42.',
      booking: 'booking-42',
    })
    expect(notificationSave).toHaveBeenCalled()
    expect(findOneMock).toHaveBeenCalledWith({ user: recipient._id })
    expect(counterDoc.count).toBe(2)
    expect(counterSave).toHaveBeenCalled()
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: recipient.email,
      subject: 'Driver Smith updated booking booking-42.',
    }))
    expect(joinURLMock).toHaveBeenCalled()
  })

  it('creates a counter when one does not exist and skips email when disabled', async () => {
    const notificationSave = jest.fn(async () => undefined)
    const NotificationMock = jest.fn().mockImplementation((doc: any) => ({ ...(doc || {}), save: notificationSave }))

    const counterSave = jest.fn(async () => undefined)
    const findOneMock = jest.fn(async () => null)
    const NotificationCounterMock: any = jest.fn().mockImplementation((doc: any) => ({ ...(doc || {}), save: counterSave }))
    NotificationCounterMock.findOne = findOneMock

    const sendMailMock = jest.fn(async () => undefined)

    const i18nMock = { locale: 'en', t: jest.fn((key: string) => key) }
    const loggerMock = { error: jest.fn(), info: jest.fn() }

    jest.unstable_mockModule('../src/models/Notification', () => ({
      __esModule: true,
      default: NotificationMock,
    }))
    jest.unstable_mockModule('../src/models/NotificationCounter', () => ({
      __esModule: true,
      default: NotificationCounterMock,
    }))
    jest.unstable_mockModule('../src/common/mailHelper', () => ({
      __esModule: true,
      sendMail: sendMailMock,
    }))
    jest.unstable_mockModule('../src/common/helper', () => ({
      __esModule: true,
      joinURL: jest.fn(() => 'https://backend/update-booking'),
      exists: jest.fn(),
      generateToken: jest.fn(),
      StringToBoolean: (input: string) => input === 'true',
    }))
    jest.unstable_mockModule('../src/lang/i18n', () => ({
      __esModule: true,
      default: i18nMock,
    }))
    jest.unstable_mockModule('../src/common/logger', () => ({
      __esModule: true,
      ...loggerMock,
    }))

    const bookingController = await import('../src/controllers/bookingController')

    const driver = { fullName: 'Driver Smith' } as any
    const recipient = {
      _id: 'user-2',
      language: 'fr',
      enableEmailNotifications: false,
      email: 'user2@example.com',
      fullName: 'User Two',
    } as any

    await bookingController.notify(driver, 'booking-99', recipient, 'confirmed booking')

    expect(findOneMock).toHaveBeenCalledWith({ user: recipient._id })
    expect(NotificationCounterMock).toHaveBeenCalledWith({ user: recipient._id, count: 1 })
    expect(counterSave).toHaveBeenCalled()
    expect(sendMailMock).not.toHaveBeenCalled()
  })
})

describe('bookingController confirm', () => {
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('returns false when car is missing', async () => {
    const i18nMock = { locale: 'en', t: jest.fn((key: string) => key) }
    const loggerMock = { error: jest.fn(), info: jest.fn() }

    const carPopulateMock = jest.fn(async () => null as any)
    const carFindByIdMock = jest.fn().mockReturnValue({ populate: carPopulateMock })

    jest.unstable_mockModule('../src/models/Car', () => ({
      __esModule: true,
      default: { findById: carFindByIdMock },
    }))
    jest.unstable_mockModule('../src/models/Location', () => ({
      __esModule: true,
      default: { findById: jest.fn() },
    }))
    jest.unstable_mockModule('../src/common/mailHelper', () => ({
      __esModule: true,
      sendMail: jest.fn(),
    }))
    jest.unstable_mockModule('../src/common/helper', () => ({
      __esModule: true,
      joinURL: jest.fn(),
      exists: jest.fn(),
      generateToken: jest.fn(),
      StringToBoolean: (input: string) => input === 'true',
    }))
    jest.unstable_mockModule('../src/lang/i18n', () => ({
      __esModule: true,
      default: i18nMock,
    }))
    jest.unstable_mockModule('../src/common/logger', () => ({
      __esModule: true,
      ...loggerMock,
    }))

    const bookingController = await import('../src/controllers/bookingController')

    const result = await bookingController.confirm(
      { language: 'en', email: 'user@example.com', fullName: 'User', enableEmailNotifications: true } as any,
      { language: 'en', contracts: [] } as any,
      { _id: 'booking-1', car: 'car-1', from: new Date(), to: new Date(), pickupLocation: 'loc-1', dropOffLocation: 'loc-2' } as any,
      true,
    )

    expect(result).toBe(false)
    expect(loggerMock.info).toHaveBeenCalledWith('Car car-1 not found')
  })

  it('sends confirmation with attachments when contract exists', async () => {
    const sendMailMock = jest.fn(async () => undefined)
    const existsMock = jest.fn(async () => true)
    const i18nMock = { locale: 'en', t: jest.fn((key: string) => key) }
    const loggerMock = { error: jest.fn(), info: jest.fn() }

    const carDoc = {
      supplier: { fullName: 'Supplier Jane', phone: '+21612345678' },
      name: 'Tesla Model 3',
    }
    const carPopulateMock = jest.fn(async () => carDoc)
    const carFindByIdMock = jest.fn().mockReturnValue({ populate: carPopulateMock })

    const pickupDoc = {
      values: [
        { language: 'fr', value: 'Retrait Tunis' },
        { language: 'en', value: 'Pickup Tunis' },
      ],
    }
    const dropDoc = {
      values: [
        { language: 'fr', value: 'Retour Sfax' },
        { language: 'en', value: 'Drop Sfax' },
      ],
    }
    const pickupPopulateMock = jest.fn(async () => pickupDoc)
    const dropPopulateMock = jest.fn(async () => dropDoc)
    const locationFindByIdMock = jest.fn()
      .mockReturnValueOnce({ populate: pickupPopulateMock })
      .mockReturnValueOnce({ populate: dropPopulateMock })

    jest.unstable_mockModule('../src/models/Car', () => ({
      __esModule: true,
      default: { findById: carFindByIdMock },
    }))
    jest.unstable_mockModule('../src/models/Location', () => ({
      __esModule: true,
      default: { findById: locationFindByIdMock },
    }))
    jest.unstable_mockModule('../src/common/mailHelper', () => ({
      __esModule: true,
      sendMail: sendMailMock,
    }))
    jest.unstable_mockModule('../src/common/helper', () => ({
      __esModule: true,
      joinURL: jest.fn(),
      exists: existsMock,
      generateToken: jest.fn(),
      StringToBoolean: (input: string) => input === 'true',
    }))
    jest.unstable_mockModule('../src/lang/i18n', () => ({
      __esModule: true,
      default: i18nMock,
    }))
    jest.unstable_mockModule('../src/common/logger', () => ({
      __esModule: true,
      ...loggerMock,
    }))

    const bookingController = await import('../src/controllers/bookingController')
    const env = await import('../src/config/env.config')

    const user = { language: 'fr', email: 'user@example.com', fullName: 'User One' } as any
    const supplier = {
      language: 'fr',
      contracts: [
        { language: 'en', file: 'contract.pdf' },
      ],
    } as any
    const booking = {
      _id: 'booking-77',
      car: 'car-77',
      from: new Date('2024-01-01T10:00:00Z'),
      to: new Date('2024-01-05T10:00:00Z'),
      pickupLocation: 'loc-10',
      dropOffLocation: 'loc-20',
    } as any

    const result = await bookingController.confirm(user, supplier, booking, true)

    expect(result).toBe(true)
    expect(sendMailMock).toHaveBeenCalledTimes(1)
    const mailCall = sendMailMock.mock.calls[0] as unknown as [Record<string, unknown>] | undefined
    expect(mailCall).toBeDefined()
    const mailOptions = mailCall![0] as { attachments?: Array<Record<string, string>> }
    expect(mailOptions.attachments).toEqual([
      { path: path.join(env.CDN_CONTRACTS, 'contract.pdf') },
    ])
    expect(existsMock).toHaveBeenCalledWith(path.join(env.CDN_CONTRACTS, 'contract.pdf'))
  })
})
