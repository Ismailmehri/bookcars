import { describe, expect, it } from 'vitest'
import { buildCsvContent } from '../csv'

describe('csv utils', () => {
  it('quotes cells and keeps semicolons inside cells safe', () => {
    const rows = [
      ['Label', 'Value'],
      ['Revenue', '1;000'],
    ]

    expect(buildCsvContent(rows)).toBe('"Label";"Value"\n"Revenue";"1;000"')
  })

  it('supports configurable delimiters and normalizes line breaks', () => {
    const rows = [
      ['Metric', 'Value'],
      ['Note', 'Line\nBreak'],
    ]

    expect(buildCsvContent(rows, { delimiter: ',' })).toBe('"Metric","Value"\n"Note","Line Break"')
  })
})
