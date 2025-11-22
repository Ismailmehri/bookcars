import * as bookcarsTypes from ':bookcars-types'

type SupplierState = 'loading' | 'error' | 'empty' | 'ready'

export const computeSupplierState = (
  isLoading: boolean,
  hasError: boolean,
  suppliers: bookcarsTypes.User[]
): SupplierState => {
  if (isLoading) {
    return 'loading'
  }

  if (hasError) {
    return 'error'
  }

  if (suppliers.length === 0) {
    return 'empty'
  }

  return 'ready'
}

export const shouldShowFilters = (user?: bookcarsTypes.User | null) => Boolean(user)
