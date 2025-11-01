import { useMemo, useReducer } from 'react'
import * as bookcarsTypes from ':bookcars-types'

export type UsersViewMode = 'table' | 'groupByAgency'

type UsersStatusFilter = 'active' | 'inactive'

interface UsersReducerState {
  keyword: string
  types: bookcarsTypes.UserType[]
  status: UsersStatusFilter[]
  verified: string[]
  agencyId?: string
  withReviews?: boolean
  lastLoginRange?: bookcarsTypes.DateRangeFilter
  sort?: bookcarsTypes.UsersSort
  page: number
  pageSize: number
  viewMode: UsersViewMode
  showReviewsForUserId?: string
  selection: string[]
  loading: boolean
  error?: string
  users: bookcarsTypes.User[]
  total: number
  kpi?: bookcarsTypes.UsersKpiResponse
  kpiLoading: boolean
}

type UsersAction =
  | { type: 'SET_KEYWORD'; payload: string }
  | { type: 'SET_TYPES'; payload: bookcarsTypes.UserType[] }
  | { type: 'SET_STATUS'; payload: UsersStatusFilter[] }
  | { type: 'SET_VERIFIED'; payload: string[] }
  | { type: 'SET_AGENCY'; payload: string | undefined }
  | { type: 'SET_WITH_REVIEWS'; payload: boolean | undefined }
  | { type: 'SET_LAST_LOGIN_RANGE'; payload: bookcarsTypes.DateRangeFilter | undefined }
  | { type: 'SET_SORT'; payload: bookcarsTypes.UsersSort | undefined }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_VIEW_MODE'; payload: UsersViewMode }
  | { type: 'SET_SHOW_REVIEWS'; payload: string | undefined }
  | { type: 'SET_SELECTION'; payload: string[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_DATA'; payload: { users: bookcarsTypes.User[]; total: number } }
  | { type: 'SET_KPI_LOADING'; payload: boolean }
  | { type: 'SET_KPI'; payload: bookcarsTypes.UsersKpiResponse | undefined }

const initialState: UsersReducerState = {
  keyword: '',
  types: [],
  status: [],
  verified: [],
  agencyId: undefined,
  withReviews: undefined,
  lastLoginRange: undefined,
  sort: undefined,
  page: 0,
  pageSize: 25,
  viewMode: 'table',
  showReviewsForUserId: undefined,
  selection: [],
  loading: false,
  error: undefined,
  users: [],
  total: 0,
  kpi: undefined,
  kpiLoading: false,
}

const reducer = (state: UsersReducerState, action: UsersAction): UsersReducerState => {
  switch (action.type) {
    case 'SET_KEYWORD':
      return { ...state, keyword: action.payload }
    case 'SET_TYPES':
      return { ...state, types: action.payload }
    case 'SET_STATUS':
      return { ...state, status: action.payload }
    case 'SET_VERIFIED':
      return { ...state, verified: action.payload }
    case 'SET_AGENCY':
      return { ...state, agencyId: action.payload }
    case 'SET_WITH_REVIEWS':
      return { ...state, withReviews: action.payload }
    case 'SET_LAST_LOGIN_RANGE':
      return { ...state, lastLoginRange: action.payload }
    case 'SET_SORT':
      return { ...state, sort: action.payload }
    case 'SET_PAGE':
      return { ...state, page: action.payload }
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload }
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    case 'SET_SHOW_REVIEWS':
      return { ...state, showReviewsForUserId: action.payload }
    case 'SET_SELECTION':
      return { ...state, selection: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_DATA':
      return { ...state, users: action.payload.users, total: action.payload.total }
    case 'SET_KPI_LOADING':
      return { ...state, kpiLoading: action.payload }
    case 'SET_KPI':
      return { ...state, kpi: action.payload }
    default:
      return state
  }
}

interface UseUsersStateParams {
  initialTypes?: bookcarsTypes.UserType[]
  initialAgencyId?: string
  initialViewMode?: UsersViewMode
}

const useUsersState = (params?: UseUsersStateParams) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    types: params?.initialTypes ?? initialState.types,
    agencyId: params?.initialAgencyId ?? initialState.agencyId,
    viewMode: params?.initialViewMode ?? initialState.viewMode,
  })

  const actions = useMemo(() => ({
    setKeyword: (keyword: string) => dispatch({ type: 'SET_KEYWORD', payload: keyword }),
    setTypes: (types: bookcarsTypes.UserType[]) => dispatch({ type: 'SET_TYPES', payload: types }),
    setStatus: (status: UsersStatusFilter[]) => dispatch({ type: 'SET_STATUS', payload: status }),
    setVerified: (verified: string[]) => dispatch({ type: 'SET_VERIFIED', payload: verified }),
    setAgencyId: (agencyId?: string) => dispatch({ type: 'SET_AGENCY', payload: agencyId }),
    setWithReviews: (withReviews?: boolean) => dispatch({ type: 'SET_WITH_REVIEWS', payload: withReviews }),
    setLastLoginRange: (range?: bookcarsTypes.DateRangeFilter) => dispatch({ type: 'SET_LAST_LOGIN_RANGE', payload: range }),
    setSort: (sort?: bookcarsTypes.UsersSort) => dispatch({ type: 'SET_SORT', payload: sort }),
    setPage: (page: number) => dispatch({ type: 'SET_PAGE', payload: page }),
    setPageSize: (pageSize: number) => dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize }),
    setViewMode: (viewMode: UsersViewMode) => dispatch({ type: 'SET_VIEW_MODE', payload: viewMode }),
    setShowReviewsForUser: (userId?: string) => dispatch({ type: 'SET_SHOW_REVIEWS', payload: userId }),
    setSelection: (selection: string[]) => dispatch({ type: 'SET_SELECTION', payload: selection }),
    setLoading: (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error?: string) => dispatch({ type: 'SET_ERROR', payload: error }),
    setUsersData: (users: bookcarsTypes.User[], total: number) => dispatch({ type: 'SET_DATA', payload: { users, total } }),
    setKpiLoading: (loading: boolean) => dispatch({ type: 'SET_KPI_LOADING', payload: loading }),
    setKpi: (kpi?: bookcarsTypes.UsersKpiResponse) => dispatch({ type: 'SET_KPI', payload: kpi }),
  }), [])

  return { state, dispatch, actions }
}

export type { UsersReducerState, UsersAction }

export default useUsersState
