import React from 'react'
import { act } from 'react-dom/test-utils'
import { createRoot, Root } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Error from '../Error'

describe('Error component', () => {
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

  it('renders an accessible alert with support contact link', () => {
    render(
      <Error
        message={(
          <span>
            Votre compte est suspendu.
            {' '}
            <a href="mailto:contact@plany.tn">contact@plany.tn</a>
          </span>
        )}
      />
    )

    const alert = container.querySelector('.error-alert')
    expect(alert?.getAttribute('role')).toBe('alert')

    const link = alert?.querySelector('a')
    expect(link?.textContent).toBe('contact@plany.tn')
    expect(link?.getAttribute('href')).toBe('mailto:contact@plany.tn')
  })
})
