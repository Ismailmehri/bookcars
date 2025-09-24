import axiosInstance from './axiosInstance'
import * as bookcarsTypes from ':bookcars-types'

export const getAgencyCommissions = (
  payload: bookcarsTypes.GetAgencyCommissionsPayload,
): Promise<bookcarsTypes.AgencyCommissionsResponse> =>
  axiosInstance
    .post(
      '/api/agency-commissions',
      payload,
      { withCredentials: true },
    )
    .then((res) => res.data)

export const downloadMonthlyInvoice = (
  supplierId: string,
  year: number,
  month: number,
) => axiosInstance.get(
  `/api/agency-commissions/invoice/${encodeURIComponent(supplierId)}/${year}/${month + 1}`,
  {
    withCredentials: true,
    responseType: 'blob',
  },
)

export const downloadBookingInvoice = (bookingId: string) => axiosInstance.get(
  `/api/agency-commissions/booking/${encodeURIComponent(bookingId)}/invoice`,
  {
    withCredentials: true,
    responseType: 'blob',
  },
)
