import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registered = (location.state as { registered?: boolean })?.registered;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-purple-400">Projeto Aura</h1>
          <p className="text-gray-500 text-sm mt-1">
            Faça login para continuar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
        >
          {registered && (
            <p className="text-green-400 text-sm bg-green-400/10 rounded-lg px-3 py-2">
              Conta criada com sucesso! Faça login para continuar.
            </p>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm text-gray-400 mb-1"
            >
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="seu_usuario"
              required
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-gray-400 mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="********"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Não tem conta?{' '}
            <Link to="/register" className="text-purple-400 hover:underline">
              Registrar-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
