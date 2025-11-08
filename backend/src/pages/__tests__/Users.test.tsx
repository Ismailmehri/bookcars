import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Users from '../Users'
import * as bookcarsTypes from ':bookcars-types'
import { strings as usersStrings } from '@/lang/users'
import { strings as insightsStrings } from '@/lang/insights'
import * as helper from '@/common/helper'

let layoutUser: bookcarsTypes.User
const getUsersStatsMock = vi.fn()
const getAllSuppliersMock = vi.fn()
const userListPropsMock = vi.fn()
const sendBulkSmsMock = vi.fn()
const sendBulkEmailMock = vi.fn()

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

vi.mock('@/services/InsightsActionService', () => ({
  __esModule: true,
  sendBulkSms: (payload: any) => sendBulkSmsMock(payload),
  sendBulkEmail: (payload: any) => sendBulkEmailMock(payload),
}))

describe('Users page', () => {
  let container: HTMLDivElement
  let root: Root
  let infoSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

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
    sendBulkSmsMock.mockReset()
    sendBulkEmailMock.mockReset()
    infoSpy = vi.spyOn(helper, 'info').mockImplementation(() => {})
    errorSpy = vi.spyOn(helper, 'error').mockImplementation(() => {})

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
    errorSpy.mockRestore()
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

  it('submits SMS action via bulk dialog for admin selections', async () => {
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

    const actionButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.users-bulk-bar__actions .MuiButton-root'),
    )
    const smsButton = actionButtons.find((button) => button.textContent?.includes(usersStrings.BULK_SEND_SMS))
    expect(smsButton).toBeDefined()

    sendBulkSmsMock.mockResolvedValue({
      succeeded: [
        { agencyId: 'u1', agencyName: 'Alice' },
        { agencyId: 'u2', agencyName: 'Bob' },
      ],
      failed: [],
      warnings: [],
    })

    await act(async () => {
      smsButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const smsDialogTitle = Array.from(document.querySelectorAll('h2')).find((node) =>
      node.textContent?.includes(usersStrings.SMS_DIALOG_TITLE),)
    expect(smsDialogTitle).toBeDefined()

    const smsDialog = smsDialogTitle?.closest('[role="dialog"]') as HTMLElement | null
    expect(smsDialog).not.toBeNull()

    const smsTextarea = smsDialog?.querySelector('textarea') as HTMLTextAreaElement
    expect(smsTextarea).toBeDefined()

    await act(async () => {
      smsTextarea.value = 'Bonjour à tous'
      smsTextarea.dispatchEvent(new Event('input', { bubbles: true }))
    })

    const confirmButton = smsDialog
      ? Array.from(smsDialog.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
        button.textContent?.includes(usersStrings.SMS_DIALOG_CONFIRM.replace('{count}', '2')),)
      : undefined
    expect(confirmButton).toBeDefined()

    await act(async () => {
      confirmButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(sendBulkSmsMock).toHaveBeenCalledWith({
      agencyIds: ['u1', 'u2'],
      message: 'Bonjour à tous',
    })

    const successMessage = usersStrings.BULK_ACTION_SUCCESS.replace('{count}', '2')
    expect(infoSpy).toHaveBeenCalledWith(successMessage)
    expect(errorSpy).not.toHaveBeenCalled()

    await act(async () => {})

    const openDialog = Array.from(document.querySelectorAll('h2')).find((node) =>
      node.textContent?.includes(usersStrings.SMS_DIALOG_TITLE),)
    expect(openDialog).toBeUndefined()
  })

  it('displays warnings and errors for bulk email dialog submissions', async () => {
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
        ids: ['u1', 'u2', 'u3'],
        rows: [
          { _id: 'u1', fullName: 'Alice' } as bookcarsTypes.User,
          { _id: 'u2', fullName: 'Bob' } as bookcarsTypes.User,
          { _id: 'u3', fullName: 'Charlie' } as bookcarsTypes.User,
        ],
      })
    })

    const actionButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.users-bulk-bar__actions .MuiButton-root'),
    )
    const emailButton = actionButtons.find((button) => button.textContent?.includes(usersStrings.BULK_SEND_EMAIL))
    expect(emailButton).toBeDefined()

    sendBulkEmailMock.mockResolvedValue({
      succeeded: [{ agencyId: 'u1', agencyName: 'Alice' }],
      failed: [{ agencyId: 'u2', agencyName: 'Bob', reason: 'MISSING_EMAIL' }],
      warnings: [{ agencyId: 'u3', agencyName: 'Charlie', reason: 'EMAIL_SEND_FAILED' }],
    })

    await act(async () => {
      emailButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const emailDialogTitle = Array.from(document.querySelectorAll('h2')).find((node) =>
      node.textContent?.includes(usersStrings.EMAIL_DIALOG_TITLE),)
    expect(emailDialogTitle).toBeDefined()

    const emailDialog = emailDialogTitle?.closest('[role="dialog"]') as HTMLElement | null
    expect(emailDialog).not.toBeNull()

    const subjectInput = emailDialog?.querySelector('input') as HTMLInputElement
    const messageTextarea = emailDialog?.querySelector('textarea') as HTMLTextAreaElement
    expect(subjectInput).toBeDefined()
    expect(messageTextarea).toBeDefined()

    await act(async () => {
      subjectInput.value = 'Annonce importante'
      subjectInput.dispatchEvent(new Event('input', { bubbles: true }))
      messageTextarea.value = 'Contenu du message'
      messageTextarea.dispatchEvent(new Event('input', { bubbles: true }))
    })

    const confirmButton = emailDialog
      ? Array.from(emailDialog.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
        button.textContent?.includes(usersStrings.EMAIL_DIALOG_CONFIRM.replace('{count}', '3')),)
      : undefined
    expect(confirmButton).toBeDefined()

    infoSpy.mockClear()
    errorSpy.mockClear()

    await act(async () => {
      confirmButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(sendBulkEmailMock).toHaveBeenCalledWith({
      agencyIds: ['u1', 'u2', 'u3'],
      subject: 'Annonce importante',
      message: 'Contenu du message',
    })

    const successMessage = usersStrings.BULK_ACTION_SUCCESS.replace('{count}', '1')
    expect(infoSpy).toHaveBeenCalledWith(successMessage)

    const warningsMessage = usersStrings.BULK_ACTION_WARNINGS
      .replace('{count}', '1')
      .replace('{details}', `Charlie: ${insightsStrings.REASON_EMAIL_FAILED}`)
    expect(infoSpy).toHaveBeenCalledWith(warningsMessage)

    const errorMessage = usersStrings.BULK_ACTION_FAILURE
      .replace('{count}', '1')
      .replace('{details}', `Bob: ${insightsStrings.REASON_MISSING_EMAIL}`)
    expect(errorSpy).toHaveBeenCalledWith(undefined, errorMessage)
  })
})
