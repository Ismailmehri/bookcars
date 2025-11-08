import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Users from '../Users'
import * as bookcarsTypes from ':bookcars-types'
import { strings as usersStrings } from '@/lang/users'
import { strings as commonStrings } from '@/lang/common'
import * as helper from '@/common/helper'

let layoutUser: bookcarsTypes.User
const getUsersStatsMock = vi.fn()
const getAllSuppliersMock = vi.fn()
const userListPropsMock = vi.fn()

/**
 * Mock Layout – composant nommé (PascalCase) + hooks OK
 */
vi.mock('@/components/Layout', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react')

  const MockLayout: React.FC<{
    onLoad?: (user?: bookcarsTypes.User) => void
    children: React.ReactNode
  }> = ({ onLoad, children }) => {
    ReactActual.useEffect(() => {
      if (onLoad) onLoad(layoutUser)
    }, [onLoad])
    return <div data-testid="layout">{children}</div>
  }

  return { __esModule: true, default: MockLayout }
})

/**
 * Mock UsersFilters – props déstructurées (règle react/destructuring-assignment)
 */
vi.mock('@/components/UsersFilters', () => ({
  __esModule: true,
  default: ({ open, admin }: any) => (
    <div data-testid="users-filters-mock" data-open={open} data-admin={admin} />
  ),
}))

/**
 * Mock UsersStatsCards
 */
vi.mock('@/components/UsersStatsCards', () => ({
  __esModule: true,
  default: () => <div data-testid="users-stats" />,
}))

/**
 * Mock UserList – props déstructurées + hook OK + on logge les props
 */
vi.mock('@/components/UserList', () => {
  const MockUserList: React.FC<any> = ({
    onTotalChange,
    onPageSummaryChange,
    onLoadingChange,
    ...rest
  }) => {
    // garder la trace des props passées au composant
    userListPropsMock({ onTotalChange, onPageSummaryChange, onLoadingChange, ...rest })

    React.useEffect(() => {
      onTotalChange?.(42)
      onPageSummaryChange?.({ from: 1, to: 10, total: 42, pageSize: 10 })
      onLoadingChange?.(false)
    }, [onTotalChange, onPageSummaryChange, onLoadingChange])

    return <div data-testid="users-list" />
  }

  return { __esModule: true, default: MockUserList }
})

/**
 * Mock UserReviewsDialog
 */
vi.mock('@/components/UserReviewsDialog', () => ({
  __esModule: true,
  default: () => <div data-testid="reviews-dialog" />,
}))

/**
 * Services
 */
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
  let infoSpy: ReturnType<typeof vi.spyOn>

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
    infoSpy = vi.spyOn(helper, 'info').mockImplementation(() => {})

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
    infoSpy.mockRestore()
  })

  it('renders admin dashboard with stats and admin options', async () => {
    await renderPage(bookcarsTypes.UserType.Admin)

    const statsBlock = container.querySelector('[data-testid="users-stats"]')
    expect(statsBlock).not.toBeNull()
    expect(getUsersStatsMock).toHaveBeenCalled()
    expect(getAllSuppliersMock).toHaveBeenCalled()

    const addButton = container.querySelector('.users-add') as HTMLButtonElement
    expect(addButton.disabled).toBe(false)

    const searchInput = container.querySelector('.users-toolbar__search input') as HTMLInputElement
    expect(searchInput.value).toBe('')

    const actionButtons = Array.from(container.querySelectorAll('.users-toolbar__actions .MuiButton-root'))
    expect(actionButtons[0]?.textContent).toContain(usersStrings.SEARCH_BUTTON)
    expect(actionButtons.some((b) => b.textContent?.includes(usersStrings.FILTERS_BUTTON))).toBe(true)
    expect(actionButtons.some((b) => b.textContent?.includes(usersStrings.RESET_VIEW))).toBe(true)
    expect(actionButtons.some((b) => b.textContent?.includes(usersStrings.SAVE_VIEW))).toBe(true)

    expect(userListPropsMock).toHaveBeenCalled()
    const firstCallProps = userListPropsMock.mock.calls[0][0]
    const lastCallProps = userListPropsMock.mock.calls[userListPropsMock.mock.calls.length - 1][0]
    const { admin: listAdmin, sortModel } = firstCallProps
    expect(listAdmin).toBe(true)
    expect(sortModel?.[0]?.field).toBe('lastLoginAt')
    expect(sortModel?.[0]?.sort).toBe('desc')
    expect(sortModel?.[1]?.field).toBe('fullName')
    expect(sortModel?.[1]?.sort).toBe('asc')
    expect(lastCallProps.onSelectionChange).toBe(firstCallProps.onSelectionChange)

    const summaryBlock = container.querySelector('.users-table-card__header')
    const expectedSummary = usersStrings.formatString(
      usersStrings.RESULTS_PAGE_SUMMARY,
      (10).toLocaleString(),
      (42).toLocaleString(),
    ) as string
    expect(summaryBlock?.textContent).toContain(expectedSummary)
  })

  it('hides admin-only features for agency users', async () => {
    await renderPage(bookcarsTypes.UserType.Supplier)

    const statsBlock = container.querySelector('[data-testid="users-stats"]')
    expect(statsBlock).toBeNull()
    expect(getUsersStatsMock).not.toHaveBeenCalled()

    const addButton = container.querySelector('.users-add') as HTMLButtonElement
    expect(addButton.disabled).toBe(true)

    expect(userListPropsMock).toHaveBeenCalled()
    const [{ admin: listAdmin }] = userListPropsMock.mock.calls
    expect(listAdmin).toBe(false)

    const supplierActionButtons = Array.from(
      container.querySelectorAll('.users-toolbar__actions .MuiButton-root'),
    )
    expect(supplierActionButtons.some((b) => b.textContent?.includes(usersStrings.FILTERS_BUTTON))).toBe(false)
    expect(supplierActionButtons.some((b) => b.textContent?.includes(usersStrings.RESET_VIEW))).toBe(false)
    expect(supplierActionButtons.some((b) => b.textContent?.includes(usersStrings.SAVE_VIEW))).toBe(false)
  })

  it('displays SMS and email bulk actions for admin selections', async () => {
    await renderPage(bookcarsTypes.UserType.Admin)

    const lastCall = userListPropsMock.mock.calls[userListPropsMock.mock.calls.length - 1]?.[0] as
      | { onSelectionChange: (selection: { ids: string[]; rows: bookcarsTypes.User[] }) => void }
      | undefined
    expect(lastCall).toBeDefined()
    if (!lastCall) {
      throw new Error('UserList props were not captured')
    }

    await act(async () => {
      lastCall.onSelectionChange({
        ids: ['u1', 'u2'],
        rows: [
          { _id: 'u1', fullName: 'Alice' } as bookcarsTypes.User,
          { _id: 'u2', fullName: 'Bob' } as bookcarsTypes.User,
        ],
      })
    })

    const bulkBar = container.querySelector('.users-bulk-bar')
    expect(bulkBar).not.toBeNull()

    const actionButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.users-bulk-bar__actions .MuiButton-root'),
    )
    const smsButton = actionButtons.find((button) => button.textContent?.includes(usersStrings.BULK_SEND_SMS))
    const emailButton = actionButtons.find((button) => button.textContent?.includes(usersStrings.BULK_SEND_EMAIL))

    expect(smsButton).toBeDefined()
    expect(emailButton).toBeDefined()

    await act(async () => {
      smsButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const dialogContent = document.querySelector('.dialog-content')
    expect(dialogContent?.textContent).toContain('SMS')

    const confirmButton = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.dialog-actions .MuiButton-root'),
    ).find((button) => button.textContent?.includes(commonStrings.CONFIRM))
    expect(confirmButton).toBeDefined()

    await act(async () => {
      confirmButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const smsMessage = usersStrings.formatString(usersStrings.BULK_SMS_SUCCESS, '2') as string
    expect(infoSpy).toHaveBeenCalledWith(smsMessage)

    infoSpy.mockClear()

    await act(async () => {
      emailButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const emailConfirmButton = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.dialog-actions .MuiButton-root'),
    ).find((button) => button.textContent?.includes(commonStrings.CONFIRM))
    expect(emailConfirmButton).toBeDefined()

    await act(async () => {
      emailConfirmButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const emailMessage = usersStrings.formatString(usersStrings.BULK_EMAIL_SUCCESS, '2') as string
    expect(infoSpy).toHaveBeenCalledWith(emailMessage)
  })
})
