import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from '../EmptyState'

describe('EmptyState', () => {
  it('renders default message', () => {
    render(<EmptyState />)
    expect(screen.getByText('Nenhum registro encontrado.')).toBeInTheDocument()
  })

  it('renders custom message', () => {
    render(<EmptyState message="Lista vazia!" />)
    expect(screen.getByText('Lista vazia!')).toBeInTheDocument()
  })
})
