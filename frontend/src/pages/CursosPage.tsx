import { useState, useEffect } from 'react'
import type { Curso } from '../types'
import { apiGet } from '../api'

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Curso[]>('/cursos')
      .then(setCursos)
      .catch((err) => setErro(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-400">Carregando...</p>
  if (erro) return <p className="text-red-400">{erro}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Cursos</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Novo Curso
        </button>
      </div>

      {cursos.length === 0 ? (
        <p className="text-gray-400">Nenhum curso cadastrado.</p>
      ) : (
        <div className="grid gap-3">
          {cursos.map((curso) => (
            <div
              key={curso.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4"
            >
              <h3 className="font-semibold text-lg">{curso.nome}</h3>
              <p className="text-sm text-gray-500">
                Adicionado em: {new Date(curso.data_entrada).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
