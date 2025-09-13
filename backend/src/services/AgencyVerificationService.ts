import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'
import env from '@/config/env.config'

export const getMyDocuments = (): Promise<bookcarsTypes.AgencyDocument[]> =>
  axiosInstance
    .get('/api/verification/my', { withCredentials: true })
    .then((res) => res.data as bookcarsTypes.AgencyDocument[])

export const upload = (
  docType: bookcarsTypes.AgencyDocumentType,
  file: File,
  note?: string,
) => {
  const formData = new FormData()
  formData.append('docType', docType)
  formData.append('file', file)
  if (note) {
    formData.append('note', note)
  }
  return axiosInstance
    .post('/api/verification/upload', formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.status)
}

export const getDocuments = (): Promise<bookcarsTypes.AgencyDocument[]> =>
  axiosInstance
    .get('/api/admin/verification', { withCredentials: true })
    .then((res) => res.data as bookcarsTypes.AgencyDocument[])

export const getVersions = (
  documentId: string,
): Promise<bookcarsTypes.AgencyDocumentVersion[]> =>
  axiosInstance
    .get(`/api/admin/verification/${encodeURIComponent(documentId)}/versions`, {
      withCredentials: true,
    })
    .then((res) => res.data as bookcarsTypes.AgencyDocumentVersion[])

export const getDownloadUrl = (versionId: string, admin = false) =>
  `${env.API_HOST}/api/${admin ? 'admin/' : ''}verification/download/${versionId}`
