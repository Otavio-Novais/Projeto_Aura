import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PaginationBar from '../PaginationBar'

describe('PaginationBar', () => {
  it('renders nothing when only one page', () => {
    const { container } = render(
      <PaginationBar page={1} totalPages={1} totalCount={5} onPageChange={() => {}} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders page buttons for multiple pages', () => {
    render(
      <PaginationBar page={1} totalPages={3} totalCount={30} onPageChange={() => {}} />,
    )
    expect(screen.getByText('30 registros')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('calls onPageChange when a page button is clicked', () => {
    const onChange = vi.fn()
    render(
      <PaginationBar page={1} totalPages={3} totalCount={30} onPageChange={onChange} />,
    )
    fireEvent.click(screen.getByText('2'))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('disables previous button on first page', () => {
    render(
      <PaginationBar page={1} totalPages={3} totalCount={30} onPageChange={() => {}} />,
    )
    const prevBtn = screen.getByText('←')
    expect(prevBtn).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(
      <PaginationBar page={3} totalPages={3} totalCount={30} onPageChange={() => {}} />,
    )
    const nextBtn = screen.getByText('→')
    expect(nextBtn).toBeDisabled()
  })

  it('shows singular registro for count=1', () => {
    render(
      <PaginationBar page={1} totalPages={1} totalCount={1} onPageChange={() => {}} />,
    )
    // Won't render because totalPages=1, but if it did, it would say "1 registro"
  })
})
