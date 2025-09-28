import { jest } from '@jest/globals'

describe('smsHelper sendSms', () => {
  const mobile = '21612345678'
  const message = 'Bonjour !'
  const originalSmsActive = process.env.BC_SMS_ACTIVE

  afterEach(() => {
    process.env.BC_SMS_ACTIVE = originalSmsActive
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('falls back to email when SMS is inactive', async () => {
    process.env.BC_SMS_ACTIVE = 'false'
    jest.resetModules()

    const sendMailMock = jest.fn(async () => ({}))
    jest.unstable_mockModule('../src/common/mailHelper', () => ({
      __esModule: true,
      sendMail: sendMailMock,
      sendMailHTML: jest.fn(),
    }))

    const smsHelper = await import('../src/common/smsHelper')
    const env = await import('../src/config/env.config')

    const result = await smsHelper.sendSms(mobile, message)

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: env.INFO_EMAIL,
      subject: expect.stringContaining(mobile),
      html: expect.stringContaining(message),
    }))
    expect(result).toEqual({
      status: 'inactive',
      message: "Service SMS désactivé. Un e-mail a été envoyé à info@plany.tn.",
    })
  })

  it('sends SMS immediately when service is active during daytime', async () => {
    process.env.BC_SMS_ACTIVE = 'true'
    jest.resetModules()

    const sendMailMock = jest.fn(async () => ({}))
    jest.unstable_mockModule('../src/common/mailHelper', () => ({
      __esModule: true,
      sendMail: sendMailMock,
      sendMailHTML: jest.fn(),
    }))

    const axiosModule = await import('axios')
    const axiosSpy = jest.spyOn(axiosModule.default, 'get').mockResolvedValue({ data: { success: true } } as any)
    const smsHelper = await import('../src/common/smsHelper')

    const fixedDate = new Date('2023-07-01T12:00:00Z')
    jest.useFakeTimers().setSystemTime(fixedDate)

    const result = await smsHelper.sendSms(mobile, message)

    expect(axiosSpy).toHaveBeenCalled()
    expect(sendMailMock).not.toHaveBeenCalled()
    expect(result).toEqual({ success: true })
  })
})

describe('smsHelper validateAndFormatPhoneNumber', () => {
  it('returns invalid result for empty input', async () => {
    jest.resetModules()
    const { validateAndFormatPhoneNumber } = await import('../src/common/smsHelper')
    expect(validateAndFormatPhoneNumber(undefined)).toEqual({ phone: '', isValide: false })
  })

  it('formats Tunisian numbers correctly', async () => {
    jest.resetModules()
    const { validateAndFormatPhoneNumber } = await import('../src/common/smsHelper')
    expect(validateAndFormatPhoneNumber('98765432')).toEqual({ phone: '21698765432', isValide: true })
    expect(validateAndFormatPhoneNumber('+21651234567')).toEqual({ phone: '21651234567', isValide: true })
  })

  it('flags invalid numbers without altering input', async () => {
    jest.resetModules()
    const { validateAndFormatPhoneNumber } = await import('../src/common/smsHelper')
    expect(validateAndFormatPhoneNumber('123')).toEqual({ phone: '123', isValide: false })
  })
})
