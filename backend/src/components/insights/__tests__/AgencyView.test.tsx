import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'
import AgencyView from '../AgencyView'

const buildMetrics = (): Parameters<typeof AgencyView>[0]['metrics'] => ({
  summary: {
    totalRevenue: 12000,
    totalBookings: 24,
    acceptedBookings: 20,
    cancelledBookings: 4,
    acceptanceRate: 83.33,
    cancellationRate: 16.67,
    averageRevenuePerBooking: 600,
    averageDuration: 3.5,
    occupancyRate: 0.55,
    rebookingRate: 0.2,
    averageLeadTime: 5.2,
  },
  rating: { average: 4.6, reviews: 32 },
  pendingUpdates: 3,
  pendingUpdatesRows: [
    {
      bookingId: 'ABC1234567890',
      carName: 'Citroën C3',
      status: bookcarsTypes.BookingStatus.Reserved,
      endDate: new Date('2025-01-12T00:00:00Z').toISOString(),
      overdueDays: 5,
    },
  ],
  topModels: [
    {
      model: 'Renault Clio',
      bookings: 12,
    },
  ],
  monthlyRevenue: [],
  weeklyTrend: [],
  viewsOverTime: [],
  statusBreakdown: [],
  revenueByModel: [],
  occupancyByModel: [],
  lastBookingAt: new Date('2025-12-10T00:00:00Z').toISOString(),
  lastConnectionAt: new Date('2025-09-13T00:00:00Z').toISOString(),
})

describe('AgencyView', () => {
  const originalLanguage = env.DEFAULT_LANGUAGE
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
    env.DEFAULT_LANGUAGE = 'fr'
    localStorage.clear()
    localStorage.setItem('bc-language', 'fr')
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
    env.DEFAULT_LANGUAGE = originalLanguage
  })

  it('renders last activity dates for the agency', () => {
    render(
      <AgencyView
        loading={false}
        agencyName="Plany Cars"
        metrics={buildMetrics()}
        onExport={() => {}}
      />,
    )

    expect(container.textContent).toContain('Dernière réservation: 10/12/2025')
    expect(container.textContent).toContain('Dernière connexion: 13/09/2025')
    const bookingLink = container.querySelector('a[href$="/update-booking?b=ABC1234567890"]') as HTMLAnchorElement
    expect(bookingLink).toBeTruthy()
    expect(bookingLink.textContent).toContain('ABC1234567890')
  })
})
