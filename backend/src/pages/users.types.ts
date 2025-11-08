import { GridColumnVisibilityModel, GridDensity, GridSortModel } from '@mui/x-data-grid'
import * as bookcarsTypes from ':bookcars-types'

export type UserVerificationFilterValue = 'verified' | 'unverified'

export type UserActivityFilterValue = 'active' | 'inactive'

export type UserBlacklistFilterValue = 'all' | 'blacklisted' | 'not_blacklisted'

export interface UsersFiltersState {
  roles: bookcarsTypes.UserType[]
  verification: UserVerificationFilterValue[]
  activity: UserActivityFilterValue[]
  blacklisted: UserBlacklistFilterValue
  agencyId: string | null
  lastLoginFrom: string | null
  lastLoginTo: string | null
}

export interface UsersPersistedState {
  keyword?: string
  filters?: UsersFiltersState
  sortModel?: GridSortModel
  columnVisibilityModel?: GridColumnVisibilityModel
  density?: GridDensity
}

export const defaultUsersFiltersState: UsersFiltersState = {
  roles: [],
  verification: [],
  activity: [],
  blacklisted: 'all',
  agencyId: null,
  lastLoginFrom: null,
  lastLoginTo: null,
}
