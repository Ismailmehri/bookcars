import * as bookcarsTypes from ':bookcars-types'
import { SupplierReviewsResponse } from '@/common/supplier'
import axiosInstance from './axiosInstance'

/**
 * Get all suppliers.
 *
 * @returns {Promise<bookcarsTypes.User[]>}
 */
export const getAllSuppliers = (): Promise<bookcarsTypes.User[]> =>
  axiosInstance
    .get(
      '/api/all-suppliers',
      { withCredentials: true }
    )
    .then((res) => res.data)

/**
 * Get suppliers.
 *
 * @param {string} keyword
 * @param {number} page
 * @param {number} size
 * @returns {Promise<bookcarsTypes.Result<bookcarsTypes.User>>}
 */
export const getSuppliers = (keyword: string, page: number, size: number): Promise<bookcarsTypes.Result<bookcarsTypes.User>> =>
  axiosInstance
    .get(
      `/api/suppliers/${page}/${size}/?s=${encodeURIComponent(keyword)}`,
      { withCredentials: true }
    )
    .then((res) => res.data)

/**
* Get frontend suppliers.
*
* @param {bookcarsTypes.GetCarsPayload} data
* @returns {Promise<bookcarsTypes.User[]>}
*/
export const getFrontendSuppliers = (data: bookcarsTypes.GetCarsPayload): Promise<bookcarsTypes.User[]> =>
  axiosInstance
    .post(
      '/api/frontend-suppliers',
      data
    ).then((res) => res.data)

export const getSupplierReviews = (
  supplierId: string,
  options: { page?: number; limit?: number } = {},
): Promise<SupplierReviewsResponse> => {
  const { page, limit } = options

  return axiosInstance
    .get(
      `/api/users/${encodeURIComponent(supplierId)}/reviews`,
      {
        params: {
          page,
          limit,
        },
      },
    )
    .then((res) => res.data)
}
