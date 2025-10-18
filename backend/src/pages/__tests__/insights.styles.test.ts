import { describe, expect, it } from 'vitest'
import { insightsPageContainerSx } from '../insights.styles'

describe('insights styles', () => {
  it('ensures insights page container keeps safe responsive padding and spacing', () => {
    const sxObject = insightsPageContainerSx as Record<string, unknown>
    const horizontalPadding = sxObject.px as Record<string, unknown> | undefined
    const verticalPadding = sxObject.py as Record<string, unknown> | undefined

    expect(sxObject.maxWidth).toBe('1440px')
    expect(sxObject.mx).toBe('auto')
    expect(sxObject.boxSizing).toBe('border-box')
    expect(horizontalPadding).toBeDefined()
    expect(verticalPadding).toBeDefined()
    expect(horizontalPadding).toMatchObject({ xs: 3, md: 6 })
    expect(verticalPadding).toMatchObject({ xs: 3, md: 4 })
  })
})
