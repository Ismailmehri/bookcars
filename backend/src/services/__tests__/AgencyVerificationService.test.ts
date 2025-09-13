import { describe, it, expect, vi } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import * as Service from '../AgencyVerificationService'
import axiosInstance from '../axiosInstance'

describe('AgencyVerificationService', () => {
  it('upload should post form data and return status', async () => {
    const file = new Blob(['content']) as unknown as File
    const post = vi.spyOn(axiosInstance, 'post').mockResolvedValue({ status: 200 } as any)

    const status = await Service.upload(bookcarsTypes.AgencyDocumentType.RC, file, 'note')

    expect(post).toHaveBeenCalledWith(
      '/api/verification/upload',
      expect.any(FormData),
      { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } },
    )
    expect(status).toBe(200)

    post.mockRestore()
  })

  it('decision should post decision and return data', async () => {
    const versionId = '123'
    const response = { data: { _id: '1', status: bookcarsTypes.AgencyDocumentStatus.ACCEPTE } }
    const post = vi.spyOn(axiosInstance, 'post').mockResolvedValue(response as any)

    const result = await Service.decision(versionId, bookcarsTypes.AgencyDocumentStatus.ACCEPTE, 'ok')

    expect(post).toHaveBeenCalledWith(
      `/api/admin/verification/${versionId}/decision`,
      { status: bookcarsTypes.AgencyDocumentStatus.ACCEPTE, comment: 'ok' },
      { withCredentials: true },
    )
    expect(result).toEqual(response.data)

    post.mockRestore()
  })
})
