import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import UnblockAgenciesDialog from '../UnblockAgenciesDialog'
import { strings } from '@/lang/insights'

const createAgencies = (blocked: boolean): bookcarsTypes.AgencyRankingItem[] => [
  {
    agencyId: 'agency-1',
    agencyName: 'Agency One',
    score: 82,
    totalCars: 12,
    totalBookings: 140,
    acceptanceRate: 0.92,
    cancellationRate: 0.04,
    pendingUpdates: 1,
    revenue: 15200,
    reviewCount: 20,
    averageRating: 4.6,
    blocked,
    email: 'agency@example.com',
    phone: '+21612345678',
  },
]

describe('UnblockAgenciesDialog', () => {
  let container: HTMLDivElement
  let root: Root

  const render = (element: React.ReactNode) => {
    act(() => {
      root.render(
        <ThemeProvider theme={createTheme()}>{element}</ThemeProvider>,
      )
    })
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    strings.setLanguage('en')
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('shows an error when submitting without a reason', () => {
    const handleSubmit = vi.fn()

    render(
      <UnblockAgenciesDialog
        open
        loading={false}
        agencies={createAgencies(true)}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />,
    )

    const buttons = container.querySelectorAll('button')
    const confirmButton = buttons[buttons.length - 1] as HTMLButtonElement

    act(() => {
      confirmButton.click()
    })

    expect(handleSubmit).not.toHaveBeenCalled()
    expect(container.textContent).toContain(strings.FORM_REQUIRED)
  })

  it('submits the trimmed reason', () => {
    const handleSubmit = vi.fn()

    render(
      <UnblockAgenciesDialog
        open
        loading={false}
        agencies={createAgencies(true)}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />,
    )

    const textArea = container.querySelector('textarea') as HTMLTextAreaElement
    expect(textArea).toBeTruthy()

    act(() => {
      textArea.value = '  Reason provided  '
      textArea.dispatchEvent(new Event('input', { bubbles: true }))
    })

    const buttons = container.querySelectorAll('button')
    const confirmButton = buttons[buttons.length - 1] as HTMLButtonElement

    act(() => {
      confirmButton.click()
    })

    expect(handleSubmit).toHaveBeenCalledTimes(1)
    expect(handleSubmit).toHaveBeenCalledWith({ reason: 'Reason provided' })
  })
})
