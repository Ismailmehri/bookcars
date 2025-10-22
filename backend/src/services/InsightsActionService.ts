import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'

const withCredentialsConfig = { withCredentials: true as const }

export const sendBulkEmail = (payload: bookcarsTypes.BulkEmailPayload): Promise<bookcarsTypes.BulkActionResponse> =>
  axiosInstance.post('/api/insights/actions/email', payload, withCredentialsConfig).then((res) => res.data)

export const sendBulkSms = (payload: bookcarsTypes.BulkSmsPayload): Promise<bookcarsTypes.BulkActionResponse> =>
  axiosInstance.post('/api/insights/actions/sms', payload, withCredentialsConfig).then((res) => res.data)

export const blockAgencies = (payload: bookcarsTypes.BulkBlockPayload): Promise<bookcarsTypes.BulkActionResponse> =>
  axiosInstance.post('/api/insights/actions/block', payload, withCredentialsConfig).then((res) => res.data)

export const unblockAgencies = (payload: bookcarsTypes.BulkUnblockPayload): Promise<bookcarsTypes.BulkActionResponse> =>
  axiosInstance.post('/api/insights/actions/unblock', payload, withCredentialsConfig).then((res) => res.data)

export const addManualNote = (payload: bookcarsTypes.BulkNotePayload): Promise<bookcarsTypes.BulkActionResponse> =>
  axiosInstance.post('/api/insights/actions/note', payload, withCredentialsConfig).then((res) => res.data)

export const getAgencyNotes = (agencyId: string): Promise<bookcarsTypes.AgencyNotesResponse> =>
  axiosInstance.get(`/api/insights/notes/${agencyId}`, withCredentialsConfig).then((res) => res.data)
