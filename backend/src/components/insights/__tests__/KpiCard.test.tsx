import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import KpiCard from '../KpiCard'

describe('KpiCard', () => {
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
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
    vi.useRealTimers()
  })

  it('renders helper text when provided', () => {
    render(<KpiCard label="Bookings" value="12" helperText="Nombre total" />)

    expect(container.textContent).toContain('Nombre total')
  })

  it('displays tooltip content on hover', () => {
    render(<KpiCard label="Revenue" value="1200" tooltip="Somme des montants" />)

    const trigger = container.querySelector('[data-testid="kpi-card-tooltip-trigger"]') as HTMLElement
    expect(trigger).toBeTruthy()

    act(() => {
      trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      vi.runAllTimers()
    })

    const tooltip = document.body.querySelector('[role="tooltip"]')
    expect(tooltip?.textContent).toContain('Somme des montants')

    act(() => {
      trigger.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
      vi.runAllTimers()
    })
  })
})
