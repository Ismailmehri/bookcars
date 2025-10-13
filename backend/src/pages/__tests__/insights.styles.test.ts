import { describe, expect, it } from 'vitest'
import { insightsPageContainerSx } from '../insights.styles'

describe('insights styles', () => {
  it('ensures insights page container adds responsive horizontal padding', () => {
    const sxObject = insightsPageContainerSx as Record<string, unknown>
    const padding = sxObject.px as Record<string, unknown> | undefined

    expect(padding).toBeDefined()
    expect(padding).toMatchObject({ xs: 2, md: 0 })
  })
})
