import { describe, it, expect, vi, afterEach } from 'vitest'
import axiosInstance from '../axiosInstance'
import * as UserService from '../UserService'

const ACCEPTANCE_RESPONSE = {
  commissionAgreementAccepted: true,
  commissionAgreementAcceptedAt: '2025-11-01T00:00:00.000Z',
}

describe('UserService.acceptCommissionAgreement', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('updates local storage and returns response payload', async () => {
    localStorage.setItem('bc-user', JSON.stringify({ _id: 'user1' }))
    const post = vi.spyOn(axiosInstance, 'post').mockResolvedValue({
      status: 200,
      data: ACCEPTANCE_RESPONSE,
    } as any)

    const result = await UserService.acceptCommissionAgreement()

    expect(post).toHaveBeenCalledWith(
      '/api/commission-agreement/accept',
      null,
      { withCredentials: true },
    )
    expect(result).toEqual(ACCEPTANCE_RESPONSE)

    const storedUser = JSON.parse(localStorage.getItem('bc-user') ?? '{}')
    expect(storedUser.commissionAgreementAccepted).toBe(true)
    expect(storedUser.commissionAgreementAcceptedAt).toBe(ACCEPTANCE_RESPONSE.commissionAgreementAcceptedAt)
  })

  it('returns response even if no user is stored', async () => {
    const post = vi.spyOn(axiosInstance, 'post').mockResolvedValue({
      status: 200,
      data: ACCEPTANCE_RESPONSE,
    } as any)

    const result = await UserService.acceptCommissionAgreement()

    expect(post).toHaveBeenCalledTimes(1)
    expect(result).toEqual(ACCEPTANCE_RESPONSE)
    expect(localStorage.getItem('bc-user')).toBeNull()
  })
})
