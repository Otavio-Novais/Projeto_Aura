import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Spinner from '../Spinner'

describe('Spinner', () => {
  it('renders a spinning element', () => {
    const { container } = render(<Spinner />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
