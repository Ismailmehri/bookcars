import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import AdminView from '../AdminView'
import { strings } from '@/lang/insights'

const buildRankingItem = (overrides?: Partial<bookcarsTypes.AgencyRankingItem>): bookcarsTypes.AgencyRankingItem => ({
  agencyId: 'agency-1',
  agencyName: 'Alpha Cars',
  score: 98,
  totalCars: 18,
  totalBookings: 240,
  acceptanceRate: 0.92,
  cancellationRate: 0.03,
  pendingUpdates: 1,
  revenue: 18250,
  reviewCount: 120,
  averageRating: 4.6,
  blocked: false,
  email: 'hello@alpha.tn',
  phone: '+21612345678',
  ...overrides,
})

const buildMetrics = (): bookcarsTypes.AdminMetricsViewModel => ({
  summary: {
    totalRevenue: 50000,
    totalBookings: 320,
    activeAgencies: 15,
    acceptanceRate: 0.86,
    cancellationRate: 0.07,
    occupancyRate: 0.74,
    acceptedBookings: 280,
    cancelledBookings: 40,
    averageRevenuePerBooking: 156,
    averageDuration: 4.1,
    currentYearRevenue: 32000,
    previousYearRevenue: 28000,
    conversionRate: 0.12,
    rebookingRate: 0.08,
    averageLeadTime: 6.2,
  },
  averageRating: 4.4,
  ranking: [buildRankingItem()],
  monthlyRevenue: [],
  weeklyTrend: [],
  viewsOverTime: [],
  statusBreakdown: [],
  revenueByModel: [],
  occupancyByModel: [],
  averageDurationByAgency: [],
  topModels: [],
})

describe('AdminView', () => {
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
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('renders agency links pointing to the relative user route', () => {
    render(
      <AdminView
        loading={false}
        metrics={buildMetrics()}
        onExport={vi.fn()}
        onRankingRefresh={vi.fn().mockResolvedValue(undefined)}
      />,
    )

    const link = container.querySelector('a[href^="/user?u="]') as HTMLAnchorElement
    expect(link).toBeTruthy()
    expect(link.getAttribute('href')).toBe('/user?u=agency-1')
  })
})
