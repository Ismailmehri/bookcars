import { render, screen } from '@testing-library/react'
import HomePage from '../page'

describe('HomePage', () => {
  it('affiche le titre de migration', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 1, name: /migration bookcars vers next\.js/i })).toBeInTheDocument()
  })

  it('propose le lien vers le plan de migration', () => {
    render(<HomePage />)
    expect(screen.getByRole('link', { name: /voir le plan de migration/i })).toBeInTheDocument()
  })
})
