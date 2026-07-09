import { useState, useEffect } from 'react'
import { apiGet } from '../api'

interface Stats {
  cursos: number
  materias: number
  avaliacoes: number
  topicos: number
  faltas: number
  lembretes: number
}

type ApiArray = { id: number }[]

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [cursos, materias, avaliacoes, topicos, lembretes] =
          await Promise.all([
            apiGet<ApiArray>('/cursos'),
            apiGet<ApiArray>('/materias'),
            apiGet<ApiArray>('/avaliacoes'),
            apiGet<ApiArray>('/topicos'),
            apiGet<ApiArray>('/lembretes'),
          ])
        setStats({
          cursos: cursos.length,
          materias: materias.length,
          avaliacoes: avaliacoes.length,
          topicos: topicos.length,
          faltas: 0,
          lembretes: lembretes.length,
        })
      } catch {
        setStats(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cards = [
    { label: 'Cursos', value: stats?.cursos, color: 'text-purple-400' },
    { label: 'Matérias', value: stats?.materias, color: 'text-blue-400' },
    {
      label: 'Avaliações',
      value: stats?.avaliacoes,
      color: 'text-yellow-400',
    },
    { label: 'Tópicos', value: stats?.topicos, color: 'text-green-400' },
    {
      label: 'Lembretes',
      value: stats?.lembretes,
      color: 'text-red-400',
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {cards.map((c) => (
            <div
              key={c.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-800 rounded w-16 mb-2" />
              <div className="h-6 bg-gray-800 rounded w-8" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {cards.map((c) => (
            <div
              key={c.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <p className="text-sm text-gray-500 mb-1">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>
                {c.value ?? '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-3">Bem-vindo ao Projeto Aura</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          Gerencie seus cursos, matérias, avaliações e muito mais.
          Use o menu lateral para navegar entre as seções e começar
          a organizar seus estudos.
        </p>
      </div>
    </div>
  )
}
