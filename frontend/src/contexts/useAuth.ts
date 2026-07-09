import { createContext, useContext } from 'react'

export interface User {
  id: number
  username: string
  email: string | null
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (
    username: string,
    password: string,
    email?: string,
  ) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
