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
    expect(alert?.textContent).toContain(strings.IS_BLACKLISTED_TITLE)

    const title = alert?.querySelector('.blacklist-notice__title')
    expect(title?.textContent).toBe(strings.IS_BLACKLISTED_TITLE)

    const description = alert?.querySelector('.blacklist-notice__description')
    expect(description?.textContent).toContain(strings.IS_BLACKLISTED_HELP)
    expect(description?.textContent).toContain(strings.SUPPORT_EMAIL)

    const supportLink = alert?.querySelector('.blacklist-notice__link')
    expect(supportLink?.getAttribute('href')).toBe(`mailto:${strings.SUPPORT_EMAIL}`)
  })
})
