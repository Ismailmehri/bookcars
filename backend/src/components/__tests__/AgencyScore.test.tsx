import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import AgencyScore from '../AgencyScore'
import * as SupplierService from '@/services/SupplierService'

vi.mock('@/services/SupplierService')

const buildScore = (value: number): bookcarsTypes.ScoreBreakdown => ({
  score: value,
  details: {
    phone: { score: 10, max: 10 },
    carConfiguration: {
      periodicPrices: { score: 8, max: 10, configuredCars: 4 },
      unavailablePeriods: { score: 9, max: 10, configuredCars: 5 },
    },
    postRentalManagement: {
      expiredPending: { score: 10, max: 10 },
      expiredReservedDeposit: { score: 9, max: 10 },
      cancelledVoidRatio: { score: 8, max: 10 },
    },
    carQuantity: { score: 8, max: 10 },
    bookingStatusHealth: { score: 9, max: 10, ratio: 0.9 },
  },
  recommendations: [],
})

type SupplierScoreMock = Mock<[string], Promise<bookcarsTypes.ScoreBreakdown>>

const mockedGetScore = SupplierService.getSupplierScore as SupplierScoreMock

describe('AgencyScore', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    mockedGetScore.mockReset()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('renders provided score without fetching again', () => {
    const initial = buildScore(82)

    act(() => {
      root.render(
        <ThemeProvider theme={createTheme()}>
          <AgencyScore agencyId="agency" initialScoreBreakdown={initial} />
        </ThemeProvider>,
      )
    })

    expect(container.textContent).toContain('82/100')
    expect(mockedGetScore).not.toHaveBeenCalled()
  })

  it('fetches score when initial value is missing', async () => {
    mockedGetScore.mockResolvedValue(buildScore(76))

    await act(async () => {
      root.render(
        <ThemeProvider theme={createTheme()}>
          <AgencyScore agencyId="agency" />
        </ThemeProvider>,
      )
    })

    await act(async () => {
      // allow effect to resolve
    })

    expect(mockedGetScore).toHaveBeenCalledWith('agency')
    expect(container.textContent).toContain('76/100')
  })
})
