import { buildProjectionFromFields } from '../carController.helpers'

describe('buildProjectionFromFields', () => {
  it('returns an empty object when no fields are provided', () => {
    expect(buildProjectionFromFields([])).toEqual({})
  })

  it('maps provided fields to zero for projection exclusion', () => {
    const projection = buildProjectionFromFields(['fieldA', 'fieldB'])

    expect(projection).toEqual({ fieldA: 0, fieldB: 0 })
  })

  it('ignores empty or whitespace-only field names', () => {
    const projection = buildProjectionFromFields(['valid', '', '   '])

    expect(projection).toEqual({ valid: 0 })
  })
})
