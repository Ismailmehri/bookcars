import { jest } from '@jest/globals'

export const mockSendMail = jest.fn(async () => ({} as unknown))
export const createTransport = jest.fn(() => ({ sendMail: mockSendMail }))

export default { createTransport }
