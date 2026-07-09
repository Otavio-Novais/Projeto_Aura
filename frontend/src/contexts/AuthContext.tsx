import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiGet, apiPost } from '../api';
import { AuthContext, type User } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const data = await apiGet<User>('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    try {
      const data = await apiPost<User>('/auth/login', { username, password });
      setUser(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await apiPost('/auth/logout', {});
    } catch {
      // Mesmo se o logout falhar, limpa o estado local
    }
    setUser(null);
  }, []);

  const register = useCallback(
    async (username: string, password: string, email?: string) => {
      setError(null);
      try {
        await apiPost<User>('/auth/register', { username, password, email });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao registrar';
        setError(message);
        throw err;
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}
