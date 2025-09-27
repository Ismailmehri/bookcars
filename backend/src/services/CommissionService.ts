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

export const getAdminCommissions = (
  payload: bookcarsTypes.GetAdminCommissionsPayload,
): Promise<bookcarsTypes.GetAdminCommissionsResponse> =>
  axiosInstance
    .post(
      '/api/admin/commissions',
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

export const sendReminder = (
  bookingId: string,
  payload: bookcarsTypes.SendCommissionReminderPayload,
): Promise<bookcarsTypes.CommissionReminderResponse> =>
  axiosInstance
    .post(
      `/api/agency-commissions/${encodeURIComponent(bookingId)}/reminders`,
      payload,
      { withCredentials: true },
    )
    .then((res) => res.data)

export const updateAgencyCommissionStatus = (
  stateId: string,
  payload: bookcarsTypes.UpdateAgencyCommissionStatusPayload,
): Promise<bookcarsTypes.AgencyCommissionStateUpdateResponse> =>
  axiosInstance
    .put(
      `/api/admin/commissions/${encodeURIComponent(stateId)}/status`,
      payload,
      { withCredentials: true },
    )
    .then((res) => res.data)

export const toggleAgencyCommissionBlock = (
  stateId: string,
  payload: bookcarsTypes.ToggleAgencyCommissionBlockPayload,
): Promise<bookcarsTypes.AgencyCommissionStateUpdateResponse> =>
  axiosInstance
    .put(
      `/api/admin/commissions/${encodeURIComponent(stateId)}/block`,
      payload,
      { withCredentials: true },
    )
    .then((res) => res.data)

export const addAgencyCommissionNote = (
  stateId: string,
  payload: bookcarsTypes.CreateAgencyCommissionNotePayload,
): Promise<bookcarsTypes.AgencyCommissionStateUpdateResponse> =>
  axiosInstance
    .post(
      `/api/admin/commissions/${encodeURIComponent(stateId)}/notes`,
      payload,
      { withCredentials: true },
    )
    .then((res) => res.data)

export const sendAgencyCommissionReminder = (
  stateId: string,
  payload: bookcarsTypes.SendAgencyCommissionReminderPayload,
): Promise<bookcarsTypes.AgencyCommissionStateUpdateResponse> =>
  axiosInstance
    .post(
      `/api/admin/commissions/${encodeURIComponent(stateId)}/reminders`,
      payload,
      { withCredentials: true },
    )
    .then((res) => res.data)

export const getCommissionSettings = (): Promise<bookcarsTypes.AgencyCommissionSettings> =>
  axiosInstance
    .get(
      '/api/admin/commission-settings',
      { withCredentials: true },
    )
    .then((res) => res.data)

export const updateCommissionSettings = (
  payload: bookcarsTypes.UpsertAgencyCommissionSettingsPayload,
): Promise<bookcarsTypes.AgencyCommissionSettings> =>
  axiosInstance
    .put(
      '/api/admin/commission-settings',
      payload,
      { withCredentials: true },
    )
    .then((res) => res.data)
