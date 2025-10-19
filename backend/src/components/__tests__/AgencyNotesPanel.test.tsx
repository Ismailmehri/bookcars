import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { beforeEach, afterEach, describe, expect, it, vi, type Mock } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import AgencyNotesPanel from '../agency/AgencyNotesPanel'
import { strings as ulStrings } from '@/lang/user-list'
import { strings as commonStrings } from '@/lang/common'
import * as InsightsActionService from '@/services/InsightsActionService'
import * as helper from '@/common/helper'

vi.mock('@/services/InsightsActionService', () => ({
  getAgencyNotes: vi.fn(),
}))

vi.mock('@/common/helper', async () => {
  const actual = await vi.importActual<typeof import('@/common/helper')>('@/common/helper')
  return {
    ...actual,
    error: vi.fn(),
  }
})

describe('AgencyNotesPanel', () => {
  let container: HTMLDivElement
  let root: Root

  const getAgencyNotesMock = InsightsActionService.getAgencyNotes as unknown as Mock

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
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    getAgencyNotesMock.mockReset()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('renders the empty state when no notes are available', async () => {
    getAgencyNotesMock.mockResolvedValue({ notes: [] })

    render(<AgencyNotesPanel agencyId="agency-1" />)

    expect(container.textContent).toContain(commonStrings.LOADING)

    await act(async () => {
      await Promise.resolve()
    })

    expect(getAgencyNotesMock).toHaveBeenCalledWith('agency-1')
    expect(container.textContent).toContain(ulStrings.AGENCY_NOTES_EMPTY)
  })

  it('renders the error state when fetching notes fails', async () => {
    const error = new Error('network-error')
    getAgencyNotesMock.mockRejectedValue(error)

    render(<AgencyNotesPanel agencyId="agency-2" />)

    await act(async () => {
      await Promise.resolve()
    })

    expect(container.textContent).toContain(ulStrings.AGENCY_NOTES_ERROR)
    expect(helper.error).toHaveBeenCalledWith(error)
  })

  it('displays notes with their metadata', async () => {
    getAgencyNotesMock.mockResolvedValue({
      notes: [
        {
          _id: 'note-1',
          agencyId: 'agency-3',
          type: bookcarsTypes.AgencyNoteType.Email,
          summary: 'Email sent',
          details: 'Subject: Welcome',
          author: { id: 'admin-1', name: 'Admin User' },
          createdAt: new Date('2024-10-05T12:34:00Z'),
          metadata: {},
        },
        {
          _id: 'note-2',
          agencyId: 'agency-3',
          type: bookcarsTypes.AgencyNoteType.Unblock,
          summary: 'Agency unblocked',
          details: 'Reason: Compliance updated',
          author: { id: 'admin-2', name: 'Second Admin' },
          createdAt: new Date('2024-10-06T08:15:00Z'),
          metadata: {},
        },
      ],
    })

    render(<AgencyNotesPanel agencyId="agency-3" />)

    await act(async () => {
      await Promise.resolve()
    })

    const items = container.querySelectorAll('[data-testid="agency-note-item"]')
    expect(items).toHaveLength(2)
    expect(container.textContent).toContain('Email sent')
    expect(container.textContent).toContain('Subject: Welcome')
    expect(container.textContent).toContain('Admin User')
    expect(container.textContent).toContain(ulStrings.AGENCY_NOTE_TYPE_EMAIL)
    expect(container.textContent).toContain('Agency unblocked')
    expect(container.textContent).toContain('Reason: Compliance updated')
    expect(container.textContent).toContain('Second Admin')
    expect(container.textContent).toContain(ulStrings.AGENCY_NOTE_TYPE_UNBLOCK)
  })
})
