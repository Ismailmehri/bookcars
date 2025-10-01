import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'

export type AgencyDocumentWithLatest = bookcarsTypes.AgencyDocument & {
  latest?: bookcarsTypes.AgencyDocumentVersion
}

export const getMyDocuments = (): Promise<AgencyDocumentWithLatest[]> =>
  axiosInstance
    .get('/api/verification/my', { withCredentials: true })
    .then((res) => res.data as AgencyDocumentWithLatest[])
