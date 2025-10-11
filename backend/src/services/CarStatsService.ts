import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'

const buildRangeQuery = (startDate?: Date, endDate?: Date) => (
  startDate && endDate
    ? `?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
    : ''
)

export const getCarStats = (
  supplierId: string | undefined,
  carId?: string,
  startDate?: Date,
  endDate?: Date,
): Promise<bookcarsTypes.CarStat[]> =>
  axiosInstance
    .get(
      `/api/car-stats/supplier/${supplierId}${carId ? `/${carId}` : ''}${buildRangeQuery(startDate, endDate)}`,
      { withCredentials: true },
    )
    .then((res) => res.data)

export const getBookingStats = (
  supplierId: string | undefined,
  carId?: string,
  startDate?: Date,
  endDate?: Date,
): Promise<bookcarsTypes.BookingStat[]> =>
  axiosInstance
    .get(
      `/api/car-stats/bookings/${supplierId}${carId ? `/${carId}` : ''}${buildRangeQuery(startDate, endDate)}`,
      { withCredentials: true },
    )
    .then((res) => res.data)

export const getBookingSummary = (
  supplierId: string | undefined,
): Promise<{ total: number; paid: number; deposit: number; reserved: number }> =>
  axiosInstance
    .get(
      `/api/car-stats/summary/${supplierId}`,
      { withCredentials: true },
    )
    .then((res) => res.data)

export const getUniqueSuppliers = (): Promise<bookcarsTypes.SuppliersStat[]> =>
  axiosInstance
    .get('/api/car-stats/suppliers', { withCredentials: true })
    .then((res) => res.data)

export const getAdminOverview = (): Promise<bookcarsTypes.AdminStatisticsOverview> =>
  axiosInstance
    .get('/api/car-stats/admin/overview', { withCredentials: true })
    .then((res) => res.data)

export const getAgencyOverview = (
  supplierId: string,
): Promise<bookcarsTypes.AgencyStatisticsOverview> =>
  axiosInstance
    .get(`/api/car-stats/agency/${supplierId}/overview`, { withCredentials: true })
    .then((res) => res.data)
