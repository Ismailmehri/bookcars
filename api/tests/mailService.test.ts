import { jest } from '@jest/globals'
import { apiConnect as mockApiConnect, mockPost, mockRequest } from './mocks/node-mailjet'
import { mockSendMail } from './mocks/nodemailer'

type HistoryRow = { date: Date; sentCount: number; openCount: number; clickCount: number }

const mockHistoryLean = jest.fn(async (): Promise<HistoryRow[]> => ([
  { date: new Date(), sentCount: 0, openCount: 0, clickCount: 0 },
]))

const mockStatFindOneAndUpdate = jest.fn(() => ({ lean: jest.fn(async () => ({ sentCount: 0 })) }))
const mockStatUpdateOne = jest.fn(async () => ({} as unknown))
const mockStatFind = jest.fn(() => ({ sort: () => ({ limit: () => ({ lean: mockHistoryLean }) }) }))

type TestRecipient = { _id?: string; email?: string; fullName?: string } | null

const mockUserLean = jest.fn(async () => null as TestRecipient)
const mockUserFindOneAndUpdate: jest.MockedFunction<() => { lean: typeof mockUserLean }> = jest.fn(() => ({ lean: mockUserLean }))
const mockUserUpdateOne: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => null)

const baseEnv = {
  BC_SMTP_HOST: '0.0.0.0',
  BC_SMTP_PORT: '1025',
  BC_SMTP_USER: 'test',
  BC_SMTP_PASS: 'test',
  BC_SMTP_FROM: 'noreply@example.com',
  MJ_SENDER_EMAIL: 'noreply@example.com',
  MJ_SENDER_NAME: 'Plany',
  EMAIL_DAILY_LIMIT: '5',
  FRONTEND_HOST: 'http://localhost:3000/',
  EMAIL_PROVIDER: 'smtp-local',
  MARKETING_API_KEY: 'test-key',
}

describe('mailService', () => {
  beforeEach(() => {
    jest.resetModules()
    mockSendMail.mockClear()
    mockRequest.mockClear()
    mockPost.mockClear()
    mockApiConnect.mockClear()
    mockUserFindOneAndUpdate.mockReset()
    mockUserUpdateOne.mockReset()
    mockUserLean.mockReset()
    mockUserFindOneAndUpdate.mockImplementation(() => ({ lean: mockUserLean }))
    mockUserLean.mockImplementation(async () => null)
  })

  const mockModels = async () => {
    await jest.unstable_mockModule('../src/models/MarketingEmailStat', () => ({
      __esModule: true,
      default: {
        findOneAndUpdate: mockStatFindOneAndUpdate,
        updateOne: mockStatUpdateOne,
        find: mockStatFind,
      },
    }))

    await jest.unstable_mockModule('../src/models/User', () => ({
      __esModule: true,
      default: { findOneAndUpdate: mockUserFindOneAndUpdate, updateOne: mockUserUpdateOne },
    }))
  }

  it('falls back to SMTP when Mailjet provider is not selected', async () => {
    process.env = { ...process.env, ...baseEnv, EMAIL_PROVIDER: 'smtp-local' }
    mockUserLean.mockResolvedValue(null)

    await mockModels()

    const mailService = await import('../src/services/mailService')

    await mailService.__setTestMailjetClient(null)
    await mailService.__setTestTransportFactory(() => ({ sendMail: mockSendMail }))

    await mailService.sendMarketingEmail('user@example.com', {
      prenom: 'Test',
      voiture: 'Model',
      prix: 10,
    })

    expect(mockSendMail).toHaveBeenCalled()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('uses Mailjet when provider is configured', async () => {
    process.env = {
      ...process.env,
      ...baseEnv,
      EMAIL_PROVIDER: 'mailjet',
      MJ_APIKEY_PUBLIC: 'public',
      MJ_APIKEY_PRIVATE: 'private',
    }

    mockUserLean.mockResolvedValue(null)

    await mockModels()

    const mailService = await import('../src/services/mailService')

    mockPost.mockReturnValue({ request: mockRequest })
    await mailService.__setTestMailjetClient({ post: mockPost } as never)
    await mailService.__setTestTransportFactory(() => ({ sendMail: mockSendMail }))

    await mailService.sendMarketingEmail('user@example.com', {
      prenom: 'Test',
      voiture: 'Model',
      prix: 10,
    })

    expect(mockPost).toHaveBeenCalled()
    expect(mockRequest).toHaveBeenCalled()
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('stops dispatch when no recipients are eligible', async () => {
    process.env = { ...process.env, ...baseEnv, EMAIL_PROVIDER: 'smtp-local' }
    mockUserLean.mockResolvedValue(null)

    await mockModels()

    const mailService = await import('../src/services/mailService')
    await mailService.__setTestTransportFactory(() => ({ sendMail: mockSendMail }))

    const result = await mailService.dispatchCampaign()

    expect(result.sent).toBe(0)
    expect(mockUserFindOneAndUpdate).toHaveBeenCalled()
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('sends to a single qualified recipient and marks them as processed', async () => {
    process.env = { ...process.env, ...baseEnv, EMAIL_PROVIDER: 'smtp-local' }
    mockUserFindOneAndUpdate
      .mockImplementationOnce(() => ({ lean: jest.fn(async () => ({ _id: 'user-1', email: 'user@example.com', fullName: 'Test User' })) }))
      .mockImplementationOnce(() => ({ lean: jest.fn(async () => null) }))

    await mockModels()

    const mailService = await import('../src/services/mailService')
    await mailService.__setTestTransportFactory(() => ({ sendMail: mockSendMail }))

    const result = await mailService.dispatchCampaign()

    expect(result.sent).toBe(1)
    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(mockUserFindOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ lastMarketingEmailDate: { $exists: false } }),
      expect.objectContaining({ $set: { lastMarketingEmailDate: expect.any(Date) } }),
      { new: true },
    )
    expect(mockUserUpdateOne).not.toHaveBeenCalled()
  })
})
