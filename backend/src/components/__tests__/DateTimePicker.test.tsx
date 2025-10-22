import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import DateTimePicker from '../DateTimePicker'

type PickerProps = Record<string, unknown>

let capturedProps: PickerProps | null = null

vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: class {},
}))

vi.mock('@mui/x-date-pickers/DateTimePicker', () => ({
  DateTimePicker: (props: PickerProps) => {
    capturedProps = props
    return <div data-testid="mock-picker" />
  },
}))

describe('DateTimePicker', () => {
  let container: HTMLDivElement
  let root: Root

  const render = (element: React.ReactNode) => {
    act(() => {
      root.render(element)
    })
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    capturedProps = null
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('passes a custom format to the MUI picker when provided', () => {
    render(<DateTimePicker value={new Date('2024-01-01T00:00:00Z')} format="dd/MM/yyyy" showTime={false} />)

    expect(capturedProps?.format).toBe('dd/MM/yyyy')
  })

  it('applies the default date-only format when showTime is false', () => {
    render(<DateTimePicker value={new Date('2024-01-02T00:00:00Z')} showTime={false} />)

    expect(capturedProps?.format).toBe('dd/MM/yyyy')
  })

  it('applies the date-time format when showTime is true', () => {
    render(<DateTimePicker value={new Date('2024-01-02T18:30:00Z')} showTime />)

    expect(capturedProps?.format).toBe('dd/MM/yyyy HH:mm')
  })
})
