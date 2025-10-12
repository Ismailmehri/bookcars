import React from 'react'
import { describe, expect, it } from 'vitest'
import { act } from 'react-dom/test-utils'
import { createRoot } from 'react-dom/client'
import { StaticInsightsContent, SectionStates } from '../StaticInsights'

type RenderResult = {
  container: HTMLDivElement
  unmount: () => void
}

const render = (element: React.ReactElement): RenderResult => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  act(() => {
    root.render(element)
  })

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('StaticInsightsContent', () => {
  it('renders admin KPIs by default', () => {
    const { container, unmount } = render(<StaticInsightsContent defaultTab="admin" />)

    expect(container.textContent).toContain('Vue Admin')
    expect(container.textContent).toContain('Agences actives')
    expect(container.textContent).toContain('CA (30j)')

    unmount()
  })

  it('switches to agency tab when clicked', () => {
    const { container, unmount } = render(<StaticInsightsContent defaultTab="admin" />)

    const tabs = container.querySelectorAll('[role="tab"]')
    expect(tabs.length).toBeGreaterThanOrEqual(2)

    const agencyTab = tabs[1] as HTMLButtonElement

    act(() => {
      agencyTab.click()
    })

    expect(container.textContent).toContain('Vue Agence')
    expect(container.textContent).toContain('Réservations (30j)')

    unmount()
  })

  it('displays fallback states when provided', () => {
    const sectionStates: SectionStates = {
      adminViews: 'loading',
      adminStatus: 'empty',
      adminFunnel: 'error',
      adminWatchlist: 'empty',
    }

    const { container, unmount } = render(
      <StaticInsightsContent defaultTab="admin" sectionStates={sectionStates} />,
    )

    expect(container.textContent?.includes('Chargement en cours')).toBe(true)

    const emptyMatches = container.textContent?.match(/Aucune donnée disponible\./g) ?? []
    expect(emptyMatches.length).toBeGreaterThan(0)

    expect(container.textContent).toContain('Une erreur est survenue lors du chargement.')
    expect(container.textContent).toContain('Aucune agence à surveiller.')

    unmount()
  })
})
