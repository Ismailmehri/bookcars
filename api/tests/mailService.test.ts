import { jest } from '@jest/globals'
import { apiConnect as mockApiConnect, mockPost, mockRequest } from './mocks/node-mailjet'
import { mockSendMail } from './mocks/nodemailer'

type HistoryRow = { date: Date; sentCount: number; openCount: number; clickCount: number }

const mockHistoryLean = jest.fn(async (): Promise<HistoryRow[]> => ([
  { date: new Date(), sentCount: 0, openCount: 0, clickCount: 0 },
]))

const mockFindOneAndUpdate = jest.fn(() => ({ lean: jest.fn(async () => ({ sentCount: 0 })) }))
const mockUpdateOne = jest.fn(async () => ({} as unknown))
const mockFind = jest.fn(() => ({ sort: () => ({ limit: () => ({ lean: mockHistoryLean }) }) }))
const mockFindUsers = jest.fn(() => ({ lean: jest.fn(async () => [] as unknown[]) }))

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
}

describe('mailService', () => {
  beforeEach(() => {
    jest.resetModules()
    mockSendMail.mockClear()
    mockRequest.mockClear()
    mockPost.mockClear()
    mockApiConnect.mockClear()
  })

  it('falls back to SMTP when sending is disabled', async () => {
    process.env = { ...process.env, ...baseEnv, ENABLE_MAIL_SENDING: 'false' }

    await jest.unstable_mockModule('../src/models/MarketingEmailStat', () => ({
      __esModule: true,
      default: {
        findOneAndUpdate: mockFindOneAndUpdate,
        updateOne: mockUpdateOne,
        find: mockFind,
      },
    }))

    await jest.unstable_mockModule('../src/models/User', () => ({
      __esModule: true,
      default: { find: mockFindUsers },
    }))

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

  it('uses Mailjet when sending is enabled', async () => {
    process.env = {
      ...process.env,
      ...baseEnv,
      ENABLE_MAIL_SENDING: 'true',
      MJ_APIKEY_PUBLIC: 'public',
      MJ_APIKEY_PRIVATE: 'private',
    }

    await jest.unstable_mockModule('../src/models/MarketingEmailStat', () => ({
      __esModule: true,
      default: {
        findOneAndUpdate: mockFindOneAndUpdate,
        updateOne: mockUpdateOne,
        find: mockFind,
      },
    }))

    await jest.unstable_mockModule('../src/models/User', () => ({
      __esModule: true,
      default: { find: mockFindUsers },
    }))

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
})
