import { createContext, useContext } from 'react'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

export interface ToastContextType {
  addToast: (message: string, type: Toast['type']) => void
}

export const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider')
  return ctx
}
