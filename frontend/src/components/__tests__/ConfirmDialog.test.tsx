import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmDialog from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog open={false} onClose={() => {}} onConfirm={() => {}} title="T" message="M" />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders title and message when open', () => {
    render(
      <ConfirmDialog open={true} onClose={() => {}} onConfirm={() => {}} title="Excluir?" message="Tem certeza?" />,
    )
    expect(screen.getByText('Excluir?')).toBeInTheDocument()
    expect(screen.getByText('Tem certeza?')).toBeInTheDocument()
  })

  it('calls onConfirm when Excluir button is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog open={true} onClose={() => {}} onConfirm={onConfirm} title="T" message="M" />,
    )
    fireEvent.click(screen.getByText('Excluir'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Cancelar button is clicked', () => {
    const onClose = vi.fn()
    render(
      <ConfirmDialog open={true} onClose={onClose} onConfirm={() => {}} title="T" message="M" />,
    )
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('disables buttons when loading', () => {
    render(
      <ConfirmDialog open={true} onClose={() => {}} onConfirm={() => {}} title="T" message="M" loading={true} />,
    )
    expect(screen.getByText('Excluindo...')).toBeDisabled()
    expect(screen.getByText('Cancelar')).toBeDisabled()
  })
})
