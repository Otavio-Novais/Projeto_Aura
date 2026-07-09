import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/cursos', label: 'Cursos', icon: '📚' },
  { to: '/docentes', label: 'Docentes', icon: '👨‍🏫' },
  { to: '/materias', label: 'Matérias', icon: '📖' },
  { to: '/avaliacoes', label: 'Avaliações', icon: '📝' },
  { to: '/topicos', label: 'Tópicos', icon: '📌' },
  { to: '/faltas', label: 'Faltas', icon: '❌' },
  { to: '/lembretes', label: 'Lembretes', icon: '🔔' },
  { to: '/tecnicas-estudo', label: 'Técnicas', icon: '🧠' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-purple-400">Projeto Aura</h1>
          <p className="text-xs text-gray-500 mt-1">Gerenciador de Estudos</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600/30 rounded-full flex items-center justify-center text-sm font-medium text-purple-400">
                {user?.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'Sem email'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <span>{loggingOut ? 'Saindo...' : 'Sair'}</span>
            </button>
            <p className="text-xs text-gray-600 text-center mt-2">
              Projeto Aura v0.1.0
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-950 p-8">
        {children}
      </main>
    </div>
  )
}
