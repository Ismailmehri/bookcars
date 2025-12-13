import { jest } from '@jest/globals'

export const mockRequest = jest.fn(async () => ({} as unknown))
export const mockPost = jest.fn(() => ({ request: mockRequest }))
export const apiConnect = jest.fn(() => ({ post: mockPost }))

export default { apiConnect }
