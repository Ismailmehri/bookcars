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
    const form = container.querySelector('form') as HTMLFormElement

    act(() => {
      Simulate.change(emailInput, { target: { value: 'blocked@agency.tn' } })
      Simulate.change(passwordInput, { target: { value: 'pass1234' } })
    })

    await act(async () => {
      Simulate.submit(form)
    })

    expect(signinMock).toHaveBeenCalled()
    expect(signoutMock).toHaveBeenCalledWith(false)

    const alert = container.querySelector('.error-alert')
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

    const formCard = container.querySelector('.signin-form')
    expect(formCard?.contains(alert)).toBe(true)
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
      Simulate.change(emailInput, { target: { value: 'user@agency.tn' } })
      Simulate.change(passwordInput, { target: { value: 'wrong' } })
    })

    await act(async () => {
      Simulate.submit(form)
    })

    const alert = container.querySelector('.error-alert')
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

    const errorContainer = container.querySelector('.form-error')
    expect(errorContainer?.contains(alert)).toBe(true)

    const firstControl = container.querySelector('.MuiFormControl-root')
    expect(firstControl).not.toBeNull()
    if (!errorContainer || !firstControl) {
      throw new Error('Expected form controls to be rendered after error container')
    }

    const position = errorContainer.compareDocumentPosition(firstControl)
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    const formCard = container.querySelector('.signin-form')
    expect(formCard?.contains(alert)).toBe(true)
  })
})
