import axiosInstance from './axiosInstance'
import * as bookcarsTypes from ':bookcars-types'

export const getMonthlyCommissions = async (
  page: number,
  size: number,
  payload: bookcarsTypes.CommissionListPayload,
): Promise<bookcarsTypes.AgencyCommissionListResponse> => {
  const response = await axiosInstance.post(
`/api/commission/list/${page}/${size}`,
    payload,
    { withCredentials: true }
)
  return response.data
}

export const exportMonthlyCommissions = async (
  page: number,
  size: number,
  payload: bookcarsTypes.CommissionListPayload,
): Promise<Blob> => {
  const response = await axiosInstance.post(
`/api/commission/export/${page}/${size}`,
    payload,
    { responseType: 'blob', withCredentials: true }
)

  return response.data as Blob
}

export const getAgencyCommissionDetails = async (
  agencyId: string,
  year: number,
  month: number,
): Promise<bookcarsTypes.AgencyCommissionDetail> => {
  const response = await axiosInstance.get(
`/api/commission/details/${agencyId}/${year}/${month}`,
    { withCredentials: true }
)
  return response.data
}

export const sendCommissionReminder = async (
  payload: bookcarsTypes.CommissionReminderPayload,
) => axiosInstance.post('/api/commission/reminder', payload, { withCredentials: true })

export const recordCommissionPayment = async (
  payload: bookcarsTypes.CommissionPaymentPayload,
) => axiosInstance.post('/api/commission/payment', payload, { withCredentials: true })

export const toggleAgencyBlock = async (
  payload: bookcarsTypes.CommissionBlockPayload,
) => axiosInstance.post('/api/commission/block', payload, { withCredentials: true })

export const addCommissionNote = async (
  payload: bookcarsTypes.CommissionNotePayload,
) => axiosInstance.post('/api/commission/note', payload, { withCredentials: true })

export const getCommissionSettings = async (): Promise<bookcarsTypes.CommissionSettings> => {
  const response = await axiosInstance.get('/api/commission/settings', { withCredentials: true })
  return response.data
}

export const updateCommissionSettings = async (
  payload: bookcarsTypes.CommissionSettingsPayload,
): Promise<bookcarsTypes.CommissionSettings> => {
  const response = await axiosInstance.put('/api/commission/settings', payload, { withCredentials: true })
  return response.data
}

export const getCommissionPaymentOptions = async (): Promise<bookcarsTypes.CommissionPaymentOptions> => {
  const response = await axiosInstance.get('/api/commission/payment/options', { withCredentials: true })
  return response.data
}

export const downloadCommissionRib = async (): Promise<Blob> => {
  const response = await axiosInstance.get('/api/commission/payment/rib', {
    responseType: 'blob',
    withCredentials: true,
  })

  return response.data as Blob
}

export const generateInvoice = async (
  agencyId: string,
  year: number,
  month: number,
): Promise<Blob> => {
  const response = await axiosInstance.get(
`/api/commission/invoice/${agencyId}/${year}/${month}`,
    { responseType: 'blob', withCredentials: true }
)
  return response.data as Blob
}

export const getAgencyCommissions = async (
  payload: bookcarsTypes.AgencyCommissionBookingsPayload,
): Promise<bookcarsTypes.AgencyCommissionBookingsResponse> => {
  const response = await axiosInstance.post(
'/api/commission/agency/bookings',
    payload,
    { withCredentials: true }
)
  return response.data
}

export const downloadMonthlyInvoice = async (
  agencyId: string,
  year: number,
  month: number,
) => axiosInstance.get(
`/api/commission/agency/${agencyId}/invoice/${year}/${month}`,
  { responseType: 'blob', withCredentials: true }
)

export const downloadBookingInvoice = async (bookingId: string) => axiosInstance.get(
  `/api/commission/agency/invoice/booking/${bookingId}`,
  { responseType: 'blob', withCredentials: true },
)
