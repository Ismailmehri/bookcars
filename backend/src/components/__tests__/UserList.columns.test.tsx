import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import UserList from '../UserList'
import { defaultUsersFiltersState } from '@/pages/users.types'
import * as UserService from '@/services/UserService'

const theme = createTheme()

const dataGridSpy = vi.fn()

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: (props: unknown) => {
    dataGridSpy(props)
    return <div data-testid="data-grid" />
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('@/services/UserService', () => ({
  getUsers: vi.fn(),
  deleteUsers: vi.fn(),
}))

vi.mock('@/common/users-sort.utils', () => ({
  mapSortModelToApiSort: () => [],
}))

vi.mock('@/common/helper', () => ({
  info: vi.fn(),
  error: vi.fn(),
}))

describe('UserList columns visibility', () => {
  const getUsersMock = UserService.getUsers as unknown as Mock

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string): MediaQueryList => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    })
  })

  beforeEach(() => {
    dataGridSpy.mockReset()
    getUsersMock.mockReset()
    getUsersMock.mockResolvedValue([
      {
        resultData: [],
        pageInfo: {
          totalRecords: 0,
        },
      },
    ])
  })

  const renderList = (props: Partial<React.ComponentProps<typeof UserList>>) =>
    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <UserList
            user={{ _id: 'user-1' } as bookcarsTypes.User}
            keyword=""
            filters={defaultUsersFiltersState}
            admin={false}
            refreshToken={0}
            selectionResetKey={0}
            sortModel={[]}
            onSortModelChange={vi.fn()}
            columnVisibilityModel={{}}
            onColumnVisibilityModelChange={vi.fn()}
            density="comfortable"
            onDensityChange={vi.fn()}
            onSelectionChange={vi.fn()}
            onReviewsClick={vi.fn()}
            {...props}
          />
        </ThemeProvider>
      </MemoryRouter>
    )

  it('exposes administrative columns when admin is true', async () => {
    renderList({ admin: true })

    await waitFor(() => expect(getUsersMock).toHaveBeenCalled())
    await waitFor(() => expect(dataGridSpy).toHaveBeenCalled())

    const lastCallArgs = dataGridSpy.mock.calls.at(-1)?.[0] as { columns: Array<{ field: string }> }
    const fields = lastCallArgs.columns.map((column) => column.field)

    expect(fields).toEqual(
      expect.arrayContaining([
        'fullName',
        'email',
        'phone',
        'type',
        'lastLoginAt',
        'createdAt',
        'reviewCount',
        'actions',
      ])
    )
  })

  it('hides administrative columns when admin is false', async () => {
    renderList({ admin: false })

    await waitFor(() => expect(getUsersMock).toHaveBeenCalled())
    await waitFor(() => expect(dataGridSpy).toHaveBeenCalled())

    const lastCallArgs = dataGridSpy.mock.calls.at(-1)?.[0] as { columns: Array<{ field: string }> }
    const fields = lastCallArgs.columns.map((column) => column.field)

    expect(fields).toEqual(expect.arrayContaining(['fullName', 'email', 'phone', 'reviewCount', 'actions']))
    expect(fields).not.toContain('type')
    expect(fields).not.toContain('lastLoginAt')
    expect(fields).not.toContain('createdAt')
  })
})
