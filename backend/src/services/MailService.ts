import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'

export const getEmailStats = (): Promise<bookcarsTypes.EmailStatsResponse> =>
  axiosInstance
    .get('/api/email/stats', { withCredentials: true })
    .then((res) => res.data)
