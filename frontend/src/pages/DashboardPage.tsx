import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../api'
import type { Avaliacao, Lembrete, Topico, Materia } from '../types'
import Spinner from '../components/Spinner'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [topicosPendentes, setTopicosPendentes] = useState<Topico[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      try {
        const [av, lem, top, mat, cursos] = await Promise.all([
          apiGet<Avaliacao[]>('/avaliacoes'),
          apiGet<Lembrete[]>('/lembretes'),
          apiGet<Topico[]>('/topicos'),
          apiGet<Materia[]>('/materias'),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apiGet<any[]>('/cursos'),
        ])
        setAvaliacoes(av)
        setLembretes(lem)
        setTopicosPendentes(top.filter((t) => !t.estudou))
        setMaterias(mat)
        setCounts({
          cursos: cursos.length,
          materias: mat.length,
          avaliacoes: av.length,
          topicos: top.length,
          lembretes: lem.length,
        })
      } catch {
        // se falhar, mostra vazio
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function getMateriaNome(id: number) {
    return materias.find((m) => m.id === id)?.nome ?? `Matéria #${id}`
  }

  const cards = [
    { label: 'Cursos', value: counts.cursos, color: 'text-purple-400' },
    { label: 'Matérias', value: counts.materias, color: 'text-blue-400' },
    { label: 'Avaliações', value: counts.avaliacoes, color: 'text-yellow-400' },
    { label: 'Tópicos', value: counts.topicos, color: 'text-green-400' },
    { label: 'Lembretes', value: counts.lembretes, color: 'text-red-400' },
  ]

  if (loading) return <Spinner />

  const proximasAvaliacoes = avaliacoes
    .filter((a) => a.data_avaliacao)
    .sort(
      (a, b) =>
        new Date(a.data_avaliacao!).getTime() -
        new Date(b.data_avaliacao!).getTime(),
    )
    .slice(0, 5)

  const proximosLembretes = [...lembretes]
    .sort(
      (a, b) =>
        new Date(a.data_lembrete).getTime() -
        new Date(b.data_lembrete).getTime(),
    )
    .slice(0, 5)

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas avaliações */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-yellow-400">
              Próximas Avaliações
            </h3>
            <Link
              to="/avaliacoes"
              className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
            >
              Ver todas
            </Link>
          </div>

          {proximasAvaliacoes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma avaliação pendente.</p>
          ) : (
            <ul className="space-y-3">
              {proximasAvaliacoes.map((av) => (
                <li key={av.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{av.nome}</p>
                    <p className="text-xs text-gray-500">
                      {getMateriaNome(av.materia)} —{' '}
                      {new Date(av.data_avaliacao!).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tópicos pendentes */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-green-400">
              Tópicos Pendentes
            </h3>
            <Link
              to="/topicos"
              className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
            >
              Ver todos
            </Link>
          </div>

          {topicosPendentes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum tópico pendente.</p>
          ) : (
            <ul className="space-y-3">
              {topicosPendentes.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.nome}</p>
                    <p className="text-xs text-gray-500">
                      {getMateriaNome(t.materia)}
                      <span
                        className={`ml-2 ${
                          t.importancia === 'Alta'
                            ? 'text-red-400'
                            : t.importancia === 'Media'
                              ? 'text-yellow-400'
                              : 'text-gray-500'
                        }`}
                      >
                        {t.importancia}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Próximos lembretes */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-red-400">
              Próximos Lembretes
            </h3>
            <Link
              to="/lembretes"
              className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
            >
              Ver todos
            </Link>
          </div>

          {proximosLembretes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum lembrete cadastrado.</p>
          ) : (
            <ul className="space-y-3">
              {proximosLembretes.map((l) => (
                <li key={l.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{l.nome}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(l.data_lembrete).toLocaleDateString('pt-BR')}
                      {l.descricao && ` — ${l.descricao}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
