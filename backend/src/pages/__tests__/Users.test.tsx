import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import Users from '../Users'
import * as bookcarsTypes from ':bookcars-types'

let layoutUser: bookcarsTypes.User
const getUsersStatsMock = vi.fn()
const getAllSuppliersMock = vi.fn()
const userListPropsMock = vi.fn()

vi.mock('@/components/Layout', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')

  return {
    __esModule: true,
    default: ({ onLoad, children }: { onLoad?: (user?: bookcarsTypes.User) => void; children: React.ReactNode }) => {
      actual.useEffect(() => {
        if (onLoad) {
          onLoad(layoutUser)
        }
      }, [onLoad])

      return <div data-testid="layout">{children}</div>
    },
  }
})

vi.mock('@/components/UsersFilters', () => ({
  __esModule: true,
  default: () => <div data-testid="users-filters" />,
}))

vi.mock('@/components/UsersStatsCards', () => ({
  __esModule: true,
  default: () => <div data-testid="users-stats" />,
}))

vi.mock('@/components/UserList', () => ({
  __esModule: true,
  default: (props: any) => {
    userListPropsMock(props)
    React.useEffect(() => {
      props.onTotalChange?.(42)
    }, [props])
    return <div data-testid="users-list" />
  },
}))

vi.mock('@/components/UserReviewsDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="reviews-dialog" />,
}))

vi.mock('@/services/UserService', () => ({
  __esModule: true,
  getUsersStats: () => getUsersStatsMock(),
  getLanguage: () => 'fr',
}))

vi.mock('@/services/SupplierService', () => ({
  __esModule: true,
  getAllSuppliers: () => getAllSuppliersMock(),
}))

describe('Users page', () => {
  let container: HTMLDivElement
  let root: Root

  const renderPage = async (userType: bookcarsTypes.UserType) => {
    layoutUser = {
      _id: 'user-1',
      fullName: 'Test User',
      type: userType,
      email: 'test@example.com',
    }

    await act(async () => {
      root.render(
        <ThemeProvider theme={createTheme()}>
          <Users />
        </ThemeProvider>,
      )
    })
  }

  beforeEach(() => {
    getUsersStatsMock.mockReset()
    getAllSuppliersMock.mockReset()
    userListPropsMock.mockReset()
    getUsersStatsMock.mockResolvedValue({
      totalUsers: { current: 120, previous: 100, growth: 20 },
      suppliers: { current: 30, previous: 25, growth: 20 },
      clients: { current: 90, previous: 75, growth: 20 },
    })
    getAllSuppliersMock.mockResolvedValue([])

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    localStorage.clear()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('renders admin dashboard with stats and bulk actions', async () => {
    await renderPage(bookcarsTypes.UserType.Admin)

    const statsBlock = container.querySelector('[data-testid="users-stats"]')
    expect(statsBlock).not.toBeNull()
    expect(getUsersStatsMock).toHaveBeenCalled()
    expect(getAllSuppliersMock).toHaveBeenCalled()

    const addButton = container.querySelector('.users-add') as HTMLButtonElement
    expect(addButton.disabled).toBe(false)

    const bulkActions = container.querySelector('.users-bulk')
    expect(bulkActions).not.toBeNull()

    expect(userListPropsMock).toHaveBeenCalled()
    const [{ admin: listAdmin }] = userListPropsMock.mock.calls
    expect(listAdmin).toBe(true)
  })

  it('hides admin-only features for agency users', async () => {
    await renderPage(bookcarsTypes.UserType.Supplier)

    const statsBlock = container.querySelector('[data-testid="users-stats"]')
    expect(statsBlock).toBeNull()
    expect(getUsersStatsMock).not.toHaveBeenCalled()

    const addButton = container.querySelector('.users-add') as HTMLButtonElement
    expect(addButton.disabled).toBe(true)

    const bulkActions = container.querySelector('.users-bulk')
    expect(bulkActions).toBeNull()

    expect(userListPropsMock).toHaveBeenCalled()
    const [{ admin: listAdmin }] = userListPropsMock.mock.calls
    expect(listAdmin).toBe(false)
  })
})
