import axiosInstance from './axiosInstance'
import * as bookcarsTypes from ':bookcars-types'

export const getMonthlyCommissions = async (
  page: number,
  size: number,
  payload: bookcarsTypes.CommissionListPayload,
): Promise<bookcarsTypes.AgencyCommissionListResponse> => {
  const response = await axiosInstance.post(`/api/commission/list/${page}/${size}`, payload)
  return response.data
}

export const exportMonthlyCommissions = async (
  page: number,
  size: number,
  payload: bookcarsTypes.CommissionListPayload,
): Promise<Blob> => {
  const response = await axiosInstance.post(`/api/commission/export/${page}/${size}`,
    payload,
    { responseType: 'blob' })

  return response.data as Blob
}

export const getAgencyCommissionDetails = async (
  agencyId: string,
  year: number,
  month: number,
): Promise<bookcarsTypes.AgencyCommissionDetail> => {
  const response = await axiosInstance.get(`/api/commission/details/${agencyId}/${year}/${month}`)
  return response.data
}

export const sendCommissionReminder = async (
  payload: bookcarsTypes.CommissionReminderPayload,
) => axiosInstance.post('/api/commission/reminder', payload)

export const recordCommissionPayment = async (
  payload: bookcarsTypes.CommissionPaymentPayload,
) => axiosInstance.post('/api/commission/payment', payload)

export const toggleAgencyBlock = async (
  payload: bookcarsTypes.CommissionBlockPayload,
) => axiosInstance.post('/api/commission/block', payload)

export const addCommissionNote = async (
  payload: bookcarsTypes.CommissionNotePayload,
) => axiosInstance.post('/api/commission/note', payload)

export const getCommissionSettings = async (): Promise<bookcarsTypes.CommissionSettings> => {
  const response = await axiosInstance.get('/api/commission/settings')
  return response.data
}

export const updateCommissionSettings = async (
  payload: bookcarsTypes.CommissionSettingsPayload,
): Promise<bookcarsTypes.CommissionSettings> => {
  const response = await axiosInstance.put('/api/commission/settings', payload)
  return response.data
}

export const generateInvoice = async (
  agencyId: string,
  year: number,
  month: number,
): Promise<Blob> => {
  const response = await axiosInstance.get(`/api/commission/invoice/${agencyId}/${year}/${month}`, { responseType: 'blob' })
  return response.data as Blob
}
