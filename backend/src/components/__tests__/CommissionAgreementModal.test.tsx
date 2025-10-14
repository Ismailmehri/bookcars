import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import CommissionAgreementModal, { buildCommissionAgreementViewModel } from '../CommissionAgreementModal'
import * as UserService from '@/services/UserService'

describe('buildCommissionAgreementViewModel', () => {
  it('formats values according to the selected language', () => {
    const result = buildCommissionAgreementViewModel({
      language: 'fr',
      commissionPercent: 6,
      effectiveDate: new Date('2025-11-01T00:00:00Z'),
      monthlyThreshold: 50,
    })

    expect(result).toEqual({
      formattedPercent: '6',
      formattedDate: '01/11/2025',
      formattedBasePrice: '100 DT',
      formattedClientPrice: '106 DT',
      formattedCommissionValue: '6 DT',
      formattedThreshold: '50 DT',
    })
  })
})

describe('CommissionAgreementModal component', () => {
  let container: HTMLDivElement
  let root: Root

  const baseProps = {
    commissionPercent: 6,
    effectiveDate: new Date('2025-11-01T00:00:00Z'),
    monthlyThreshold: 50,
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(UserService, 'getLanguage').mockReturnValue('fr')
  })

  afterEach(() => {
    root.unmount()
    container.remove()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('disables accept button during submission and triggers callback afterwards', () => {
    const onAccept = vi.fn()

    act(() => {
      root.render(
        <CommissionAgreementModal
          open
          accepting
          onAccept={onAccept}
          {...baseProps}
        />,
      )
    })

    const disabledButton = document.querySelector('button.MuiButton-root')
    expect(disabledButton?.getAttribute('disabled')).not.toBeNull()

    act(() => {
      root.render(
        <CommissionAgreementModal
          open
          accepting={false}
          onAccept={onAccept}
          {...baseProps}
        />,
      )
    })

    const acceptButton = document.querySelector('button.MuiButton-root')
    expect(acceptButton?.getAttribute('disabled')).toBeNull()

    act(() => {
      acceptButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onAccept).toHaveBeenCalledTimes(1)
    expect(document.body.textContent).toContain('106 DT')
  })
})
