import { NavLink } from 'react-router-dom'

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

        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">
            Projeto Aura v0.1.0
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-950 p-8">
        {children}
      </main>
    </div>
  )
}
