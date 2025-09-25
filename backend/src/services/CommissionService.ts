import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'

export const getAgencyCommissions = (payload: bookcarsTypes.AgencyCommissionsPayload): Promise<bookcarsTypes.AgencyCommissionsResponse> =>
  axiosInstance
    .post(
      '/api/agency-commissions',
      payload,
      { withCredentials: true },
    )
    .then((res) => res.data)

export const remindSupplier = (bookingId: string): Promise<bookcarsTypes.CommissionBooking> =>
  axiosInstance
    .post(
      `/api/agency-commissions/${encodeURIComponent(bookingId)}/remind-supplier`,
      null,
      { withCredentials: true },
    )
    .then((res) => res.data)

export const remindClient = (bookingId: string): Promise<bookcarsTypes.CommissionBooking> =>
  axiosInstance
    .post(
      `/api/agency-commissions/${encodeURIComponent(bookingId)}/remind-client`,
      null,
      { withCredentials: true },
    )
    .then((res) => res.data)
