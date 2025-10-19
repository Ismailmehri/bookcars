import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import Insights from '../Insights'
import { strings } from '@/lang/insights'

type AgencyMetricsViewModel = import('../insights.types').AgencyMetricsViewModel

type AdminMetricsViewModel = import('../insights.types').AdminMetricsViewModel

const setSelectedAgencyMock = vi.fn()
const setAdminTabLoadedMock = vi.fn()

const buildAgencySummary = (): bookcarsTypes.AgencyStatsSummary => ({
  totalRevenue: 0,
  totalBookings: 0,
  acceptedBookings: 0,
  cancelledBookings: 0,
  acceptanceRate: 0,
  cancellationRate: 0,
  averageRevenuePerBooking: 0,
  averageDuration: 0,
  occupancyRate: 0,
  rebookingRate: 0,
  averageLeadTime: 0,
})

const agencyMetrics: AgencyMetricsViewModel = {
  summary: buildAgencySummary(),
  rating: undefined,
  pendingUpdates: 0,
  pendingUpdatesRows: [],
  topModels: [],
  monthlyRevenue: [],
  weeklyTrend: [],
  viewsOverTime: [],
  statusBreakdown: [],
  revenueByModel: [],
  occupancyByModel: [],
  lastBookingAt: undefined,
  lastConnectionAt: undefined,
}

const adminMetrics: AdminMetricsViewModel = {
  summary: {
    totalRevenue: 0,
    totalBookings: 0,
    activeAgencies: 0,
    acceptanceRate: 0,
    cancellationRate: 0,
    occupancyRate: 0,
    acceptedBookings: 0,
    cancelledBookings: 0,
    averageRevenuePerBooking: 0,
    averageDuration: 0,
    currentYearRevenue: 0,
    previousYearRevenue: 0,
    conversionRate: 0,
    rebookingRate: 0,
    averageLeadTime: 0,
  },
  averageRating: undefined,
  ranking: [],
  monthlyRevenue: [],
  weeklyTrend: [],
  viewsOverTime: [],
  statusBreakdown: [],
  revenueByModel: [],
  occupancyByModel: [],
  averageDurationByAgency: [],
  topModels: [],
}

vi.mock('@/components/Layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}))

vi.mock('@/components/DateTimePicker', () => ({
  __esModule: true,
  default: ({ label, format }: { label?: string; format?: string }) => (
    <div data-testid={`picker-${label}`} data-format={format} />
  ),
}))

vi.mock('@/components/insights/AgencyView', () => ({
  __esModule: true,
  default: () => <div data-testid="agency-view" />,
}))

vi.mock('@/components/insights/AdminView', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-view" />,
}))

vi.mock('../useInsightsMetrics', () => ({
  useInsightsMetrics: () => ({
    user: { _id: 'admin', fullName: 'Admin User', type: bookcarsTypes.RecordType.Admin },
    isAdmin: true,
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-31T00:00:00Z'),
    setStartDate: vi.fn(),
    setEndDate: vi.fn(),
    selectedAgency: '',
    setSelectedAgency: setSelectedAgencyMock,
    agencyOptions: [
      { id: 'agency-1', name: 'Alpha Cars' },
      { id: 'agency-2', name: 'Beta Motors' },
    ],
    agencyMetrics,
    adminMetrics,
    loading: false,
    buttonLoading: false,
    error: null,
    tab: 'admin',
    setTab: vi.fn(),
    adminTabLoaded: true,
    setAdminTabLoaded: setAdminTabLoadedMock,
    applyFilters: vi.fn().mockResolvedValue(undefined),
    handleUserLoaded: vi.fn(),
    handleExportAgency: vi.fn(),
    handleExportAdmin: vi.fn(),
    refreshAdminOverview: vi.fn(),
  }),
}))

describe('Insights page', () => {
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
    strings.setLanguage('fr')
    setSelectedAgencyMock.mockClear()
    setAdminTabLoadedMock.mockClear()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('exposes a searchable agency selector and updates filters on selection', () => {
    render(<Insights />)

    const input = container.querySelector('input[role="combobox"]') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.getAttribute('placeholder')).toBe(strings.AGENCY_SEARCH_PLACEHOLDER)
    expect(input.getAttribute('aria-autocomplete')).toBe('list')

    act(() => {
      input.focus()
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    })

    const options = Array.from(document.body.querySelectorAll('li[role="option"]')) as HTMLElement[]
    expect(options.length).toBeGreaterThan(0)

    act(() => {
      options[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(setSelectedAgencyMock).toHaveBeenCalledWith('agency-2')
    expect(setAdminTabLoadedMock).toHaveBeenCalledWith(false)
  })
})
