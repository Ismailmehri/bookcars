import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { MemoryRouter } from 'react-router-dom'
import * as bookcarsTypes from ':bookcars-types'
import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import UserList from '../UserList'
import { defaultUsersFiltersState } from '@/pages/users.types'
import { strings } from '@/lang/user-list'
import * as UserService from '@/services/UserService'
import * as helper from '@/common/helper'

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({
    rows,
    columns,
  }: {
    rows: bookcarsTypes.User[]
    columns: Array<{ field: string; renderCell?: (params: Record<string, unknown>) => React.ReactNode }>
  }) => (
    <div data-testid="data-grid">
      {rows.map((row) => (
        <div key={row._id ?? ''} data-testid={`row-${row._id}`}>
          {columns.map((column) => (
            <div key={column.field}>
              {column.renderCell
                ? column.renderCell({
                    id: row._id,
                    row,
                    field: column.field,
                    value: (row as Record<string, unknown>)[column.field],
                  })
                : (row as Record<string, unknown>)[column.field] ?? null}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}))

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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

const theme = createTheme()

describe('UserList action navigation', () => {
  const getUsersMock = UserService.getUsers as unknown as Mock
  const errorMock = helper.error as unknown as Mock

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
    mockNavigate.mockReset()
    errorMock.mockReset()
    getUsersMock.mockResolvedValue([
      {
        resultData: [
          {
            _id: 'user-1',
            fullName: 'John Doe',
            email: 'john@example.com',
            type: bookcarsTypes.UserType.Admin,
          },
        ],
        pageInfo: {
          totalRecords: 1,
        },
      },
    ])
  })

  it('navigates with the selected user id when triggering reset password', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <UserList
            user={{ _id: 'admin-1' } as bookcarsTypes.User}
            keyword=""
            filters={defaultUsersFiltersState}
            admin
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
          />
        </ThemeProvider>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(getUsersMock).toHaveBeenCalled()
    })

    const actionButton = await screen.findByLabelText(new RegExp(strings.ACTIONS_COLUMN, 'i'))
    fireEvent.click(actionButton)

    const resetItem = await screen.findByText(new RegExp(strings.RESET_PASSWORD, 'i'))
    fireEvent.click(resetItem)

    expect(mockNavigate).toHaveBeenCalledWith('/reset-password?u=user-1')
    expect(errorMock).not.toHaveBeenCalled()
  })
})
