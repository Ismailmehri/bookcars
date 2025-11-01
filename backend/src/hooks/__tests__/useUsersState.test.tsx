import { act, renderHook } from '@testing-library/react'
import * as bookcarsTypes from ':bookcars-types'
import useUsersState from '@/hooks/useUsersState'

describe('useUsersState', () => {
  it('should initialise with defaults', () => {
    const { result } = renderHook(() => useUsersState())
    expect(result.current.state.keyword).toBe('')
    expect(result.current.state.types).toEqual([])
    expect(result.current.state.page).toBe(0)
    expect(result.current.state.users).toEqual([])
  })

  it('should update filters and pagination', () => {
    const { result } = renderHook(() => useUsersState())

    act(() => {
      result.current.actions.setKeyword('john')
      result.current.actions.setTypes([bookcarsTypes.UserType.Admin])
      result.current.actions.setStatus(['active'])
      result.current.actions.setPage(2)
      result.current.actions.setPageSize(50)
    })

    expect(result.current.state.keyword).toBe('john')
    expect(result.current.state.types).toEqual([bookcarsTypes.UserType.Admin])
    expect(result.current.state.status).toEqual(['active'])
    expect(result.current.state.page).toBe(2)
    expect(result.current.state.pageSize).toBe(50)
  })

  it('should store users data and KPI values', () => {
    const { result } = renderHook(() => useUsersState())
    const users: bookcarsTypes.User[] = [
      {
        _id: '1',
        email: 'john@example.com',
        phone: '123',
        location: '',
        bio: '',
        fullName: 'John Doe',
        type: bookcarsTypes.UserType.Admin,
      },
    ]

    const kpi: bookcarsTypes.UsersKpiResponse = {
      totalUsers: 10,
      admins: 2,
      agencies: 3,
      drivers: 5,
      inactive: 1,
      withNoReviews: 4,
      newUsers7d: 2,
      newUsers30d: 6,
    }

    act(() => {
      result.current.actions.setUsersData(users, 10)
      result.current.actions.setKpi(kpi)
    })

    expect(result.current.state.users).toEqual(users)
    expect(result.current.state.total).toBe(10)
    expect(result.current.state.kpi).toEqual(kpi)
  })
})
