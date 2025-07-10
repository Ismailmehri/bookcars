import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'

export const create = (payload: bookcarsTypes.CreateSubscriptionPayload): Promise<number> =>
  axiosInstance
    .post('/api/create-subscription', payload, { withCredentials: true })
    .then((res) => res.status)

export const getCurrent = (): Promise<bookcarsTypes.Subscription> =>
  axiosInstance
    .get('/api/my-subscription', { withCredentials: true })
    .then((res) => res.data)
