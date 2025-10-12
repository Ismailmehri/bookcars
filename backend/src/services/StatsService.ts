import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'

const buildQuery = (startDate: Date, endDate: Date) =>
  `?start=${startDate.toISOString()}&end=${endDate.toISOString()}`

export const getAgencyStats = (
  supplierId: string,
  startDate: Date,
  endDate: Date,
): Promise<bookcarsTypes.AgencyStatsResponse> =>
  axiosInstance
    .get(`/api/stats/agency/${supplierId}${buildQuery(startDate, endDate)}`, { withCredentials: true })
    .then((res) => res.data)

export const getAdminStats = (
  startDate: Date,
  endDate: Date,
): Promise<bookcarsTypes.AdminStatsResponse> =>
  axiosInstance
    .get(`/api/stats/admin${buildQuery(startDate, endDate)}`, { withCredentials: true })
    .then((res) => res.data)
