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

export const getSubscriptions = (page: number, size: number): Promise<bookcarsTypes.Result<bookcarsTypes.Subscription>> =>
  axiosInstance
    .get(`/api/subscriptions/${page}/${size}`, { withCredentials: true })
    .then((res) => res.data)

export const getSubscription = (id: string): Promise<bookcarsTypes.Subscription> =>
  axiosInstance
    .get(`/api/subscription/${id}`, { withCredentials: true })
    .then((res) => res.data)

export const update = (payload: bookcarsTypes.UpdateSubscriptionPayload): Promise<number> =>
  axiosInstance
    .post('/api/update-subscription', payload, { withCredentials: true })
    .then((res) => res.status)
