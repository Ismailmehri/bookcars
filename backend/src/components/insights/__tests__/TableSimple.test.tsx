import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TableSimple, { type TableColumn } from '../TableSimple'

type Row = {
  name: string
  bookings: number
}

const buildColumns = (): TableColumn<Row>[] => [
  { key: 'name', label: 'Name' },
  { key: 'bookings', label: 'Bookings', align: 'right' },
]

const createMatchMedia = (matches: boolean) => (query: string) => ({
  matches,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})

describe('TableSimple', () => {
  let container: HTMLDivElement
  let root: Root

  const render = (element: React.ReactNode) => {
    act(() => {
      root.render(
        <ThemeProvider theme={createTheme()}>
          {element}
        </ThemeProvider>,
      )
    })
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    window.matchMedia = vi.fn().mockImplementation(createMatchMedia(false)) as unknown as typeof window.matchMedia
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('sorts tabular rows when clicking on a sortable header', () => {
    render(
      <TableSimple
        columns={buildColumns()}
        data={[
          { name: 'Beta', bookings: 2 },
          { name: 'Alpha', bookings: 5 },
        ]}
        emptyLabel="Empty"
        rowsPerPageOptions={[5]}
        initialRowsPerPage={5}
        getRowId={(row) => row.name}
      />,
    )

    const getRowOrder = () =>
      Array.from(container.querySelectorAll('tbody tr')).map((row) => row.textContent?.trim() ?? '')

    expect(getRowOrder()[0]).toContain('Beta')

    const headerButton = container.querySelector('th button') as HTMLButtonElement
    expect(headerButton).toBeTruthy()

    act(() => {
      headerButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(getRowOrder()[0]).toContain('Alpha')

    act(() => {
      headerButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(getRowOrder()[0]).toContain('Beta')
  })

  it('renders mobile cards and sorts via the responsive selector', () => {
    window.matchMedia = vi.fn().mockImplementation(createMatchMedia(true)) as unknown as typeof window.matchMedia

    render(
      <TableSimple
        columns={buildColumns()}
        data={[
          { name: 'Beta', bookings: 2 },
          { name: 'Alpha', bookings: 5 },
        ]}
        emptyLabel="Empty"
        rowsPerPageOptions={[5]}
        initialRowsPerPage={5}
        mobileSortLabel="Trier"
        getRowId={(row) => row.name}
      />,
    )

    const cardsBefore = container.querySelectorAll('[data-testid="table-simple-card"]')
    expect(cardsBefore).toHaveLength(2)
    expect(cardsBefore[0].textContent).toContain('Beta')

    const comboBox = container.querySelector('[role="combobox"]') as HTMLElement
    expect(comboBox).toBeTruthy()

    act(() => {
      comboBox.dispatchEvent(new MouseEvent('mouseDown', { bubbles: true }))
    })

    const options = Array.from(document.body.querySelectorAll('li[role="option"]')) as HTMLElement[]
    const nameOption = options.find((option) => option.textContent?.includes('Name'))
    expect(nameOption).toBeTruthy()

    act(() => {
      nameOption?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const cardsAfterSelect = container.querySelectorAll('[data-testid="table-simple-card"]')
    expect(cardsAfterSelect[0].textContent).toContain('Alpha')

    const toggleButton = container.querySelector('button[aria-label^="Toggle"]') as HTMLButtonElement
    expect(toggleButton).toBeTruthy()

    act(() => {
      toggleButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const cardsAfterToggle = container.querySelectorAll('[data-testid="table-simple-card"]')
    expect(cardsAfterToggle[0].textContent).toContain('Beta')
  })
})
