import { AxiosResponse } from 'axios'
import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'

export type AgencyDocumentWithLatest = bookcarsTypes.AgencyDocument & {
  latest?: bookcarsTypes.AgencyDocumentVersion
}

export const getMyDocuments = (): Promise<AgencyDocumentWithLatest[]> =>
  axiosInstance
    .get('/api/verification/my', { withCredentials: true })
    .then((res) => res.data as AgencyDocumentWithLatest[])

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

export const download = (
  versionId: string,
  admin = false,
): Promise<AxiosResponse<Blob>> =>
  axiosInstance.get(
    `/api/${admin ? 'admin/' : ''}verification/download/${versionId}`,
    {
      withCredentials: true,
      responseType: 'blob',
    },
  )
