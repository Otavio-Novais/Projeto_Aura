import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    setLoading(true);

    try {
      await register(username, password, email || undefined);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-purple-400">Projeto Aura</h1>
          <p className="text-gray-500 text-sm mt-1">Crie sua conta</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
        >
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
              minLength={3}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
              Email (opcional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="email@exemplo.com"
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
              minLength={6}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm text-gray-400 mb-1"
            >
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="********"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Já tem conta?{' '}
            <Link to="/login" className="text-purple-400 hover:underline">
              Fazer login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
