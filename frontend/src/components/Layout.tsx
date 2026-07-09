import { useState, useCallback } from 'react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    navigate('/login')
  }

  const sidebarContent = (
    <>
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
            onClick={closeSidebar}
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
              <p className="text-sm text-gray-300 truncate">{user?.username}</p>
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
    </>
  )

  return (
    <div className="flex h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 bg-gray-900 border-r border-gray-800 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeSidebar}
          />
          <aside className="relative w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col z-50">
            {sidebarContent}
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-y-auto bg-gray-950 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-gray-200 p-1"
            aria-label="Abrir menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 4.5A.5.5 0 012.5 4h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5zm0 5a.5.5 0 01.5-.5h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5zm0 5a.5.5 0 01.5-.5h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5z" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-purple-400">Projeto Aura</h1>
        </div>

        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
