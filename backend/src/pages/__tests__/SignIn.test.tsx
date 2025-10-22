import React from 'react'
import { act, Simulate } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import SignIn from '../SignIn'
import { strings } from '@/lang/sign-in'

const navigateMock = vi.fn()
const signinMock = vi.fn()
const signoutMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('@/components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}))

vi.mock('@/services/UserService', () => ({
  __esModule: true,
  signin: (...args: unknown[]) => signinMock(...args),
  signout: (...args: unknown[]) => signoutMock(...args),
}))

describe('SignIn page', () => {
  let container: HTMLDivElement
  let root: Root

  const render = (node: React.ReactNode) => {
    act(() => {
      root.render(
        <ThemeProvider theme={createTheme()}>
          {node}
        </ThemeProvider>,
      )
    })
  }

  beforeEach(() => {
    signinMock.mockReset()
    signoutMock.mockReset()
    navigateMock.mockReset()
    strings.setLanguage('fr')

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  it('surfaces a localized blacklist warning with support email', async () => {
    signinMock.mockResolvedValue({
      status: 200,
      data: {
        blacklisted: true,
      },
    })
    signoutMock.mockResolvedValue(undefined)

    render(<SignIn />)

    const emailInput = container.querySelector('input#email') as HTMLInputElement
    const passwordInput = container.querySelector('input#password') as HTMLInputElement
    const formElement = container.querySelector('form') as HTMLFormElement

    act(() => {
      emailInput.value = 'blocked@agency.tn'
      passwordInput.value = 'pass1234'
      Simulate.change(emailInput)
      Simulate.change(passwordInput)
    })

    await act(async () => {
      Simulate.submit(formElement)
    })

    expect(signinMock).toHaveBeenCalled()
    expect(signoutMock).toHaveBeenCalledWith(false)

    const alert = container.querySelector('.error-alert--warning')
    expect(alert).not.toBeNull()
    if (!alert) {
      throw new Error('Expected blacklist alert to be rendered')
    }
    expect(alert.textContent).toContain(strings.IS_BLACKLISTED_TITLE)

    const notice = alert.querySelector('.alert-notice--blacklist')
    expect(notice).not.toBeNull()

    const title = notice?.querySelector('.alert-notice__title')
    expect(title?.textContent).toBe(strings.IS_BLACKLISTED_TITLE)

    const description = notice?.querySelector('.alert-notice__description')
    expect(description?.textContent).toContain(strings.IS_BLACKLISTED_HELP)
    expect(description?.textContent).toContain(strings.SUPPORT_EMAIL)

    const supportLink = notice?.querySelector('.alert-notice__link')
    expect(supportLink?.getAttribute('href')).toBe(`mailto:${strings.SUPPORT_EMAIL}`)

    const alertsContainer = container.querySelector('.signin-alerts')
    expect(alertsContainer).not.toBeNull()
    if (!alertsContainer) {
      throw new Error('Expected alerts container to be rendered for blacklist state')
    }
    expect(alertsContainer.contains(alert)).toBe(true)

    const formCard = container.querySelector('.signin-form')
    expect(formCard?.contains(alertsContainer)).toBe(true)
  })

  it('shows credential errors above the form fields with localized help', async () => {
    signinMock.mockResolvedValue({
      status: 401,
    })
    signoutMock.mockResolvedValue(undefined)

    render(<SignIn />)

    const emailInput = container.querySelector('input#email') as HTMLInputElement
    const passwordInput = container.querySelector('input#password') as HTMLInputElement
    const form = container.querySelector('form') as HTMLFormElement

    act(() => {
      emailInput.value = 'user@agency.tn'
      passwordInput.value = 'wrong'
      Simulate.change(emailInput)
      Simulate.change(passwordInput)
    })

    await act(async () => {
      Simulate.submit(form)
    })

    const alert = container.querySelector('.error-alert--error')
    expect(alert).not.toBeNull()
    if (!alert) {
      throw new Error('Expected credential alert to be rendered')
    }

    const notice = alert.querySelector('.alert-notice--credentials')
    expect(notice).not.toBeNull()
    if (!notice) {
      throw new Error('Expected credential notice markup to be rendered')
    }

    expect(notice.querySelector('.alert-notice__title')?.textContent).toBe(strings.ERROR_IN_SIGN_IN_TITLE)
    expect(notice.querySelector('.alert-notice__description')?.textContent).toContain(strings.ERROR_IN_SIGN_IN_HELP)
    expect(notice.querySelector('.alert-notice__description')?.textContent).toContain(strings.SUPPORT_EMAIL)

    const supportLink = notice.querySelector<HTMLAnchorElement>('.alert-notice__link')
    expect(supportLink?.getAttribute('href')).toBe(`mailto:${strings.SUPPORT_EMAIL}`)

    const alertsContainer = container.querySelector('.signin-alerts')
    expect(alertsContainer).not.toBeNull()
    if (!alertsContainer) {
      throw new Error('Expected alerts container to be rendered for credential errors')
    }

    const formCard = container.querySelector('.signin-form')
    expect(formCard).not.toBeNull()
    if (!formCard) {
      throw new Error('Expected sign-in card to be rendered')
    }

    const cardForm = formCard.querySelector('form')
    expect(cardForm).not.toBeNull()
    if (!cardForm) {
      throw new Error('Expected form element inside sign-in card')
    }

    expect(alertsContainer.contains(alert)).toBe(true)
    expect(formCard.contains(alertsContainer)).toBe(true)
    expect(formCard.contains(cardForm)).toBe(true)

    const position = alertsContainer.compareDocumentPosition(cardForm)
    const followingPositions = [
      Node.DOCUMENT_POSITION_FOLLOWING,
      Node.DOCUMENT_POSITION_FOLLOWING + Node.DOCUMENT_POSITION_CONTAINED_BY,
    ]
    expect(followingPositions).toContain(position)
  })
})
