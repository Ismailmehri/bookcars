import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'

export const create = (payload: bookcarsTypes.CreateSubscriptionPayload): Promise<number> =>
  axiosInstance
    .post('/api/create-subscription', payload, { withCredentials: true })
    .then((res) => res.status)
