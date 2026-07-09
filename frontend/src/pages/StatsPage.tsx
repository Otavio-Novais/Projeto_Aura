import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '../api'
import type { Materia, Avaliacao, Topico, Falta, PaginatedResponse } from '../types'
import Spinner from '../components/Spinner'

export default function StatsPage() {
  const [loading, setLoading] = useState(true)
  const [medias, setMedias] = useState<{ nome: string; media: number; pct: number }[]>([])
  const [topicoStats, setTopicoStats] = useState({ estudados: 0, pendentes: 0, total: 0 })
  const [faltaStats, setFaltaStats] = useState<{ nome: string; qtd: number; max: number }[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [mat, av, top] = await Promise.all([
        apiGet<PaginatedResponse<Materia>>('/materias?page=1&page_size=9999'),
        apiGet<PaginatedResponse<Avaliacao>>('/avaliacoes?page=1&page_size=9999'),
        apiGet<PaginatedResponse<Topico>>('/topicos?page=1&page_size=9999'),
      ])

      const estudados = top.items.filter((t) => t.estudou).length
      setTopicoStats({ estudados, pendentes: top.items.length - estudados, total: top.items.length })

      const byMat: Record<number, { nome: string; pesoTotal: number; notaTotal: number }> = {}
      av.items.forEach((a) => {
        if (a.nota_obtida == null) return
        const m = mat.items.find((x) => x.id === a.materia)
        const nome = m?.nome ?? `Matéria #${a.materia}`
        if (!byMat[a.materia]) byMat[a.materia] = { nome, pesoTotal: 0, notaTotal: 0 }
        byMat[a.materia].pesoTotal += a.peso
        byMat[a.materia].notaTotal += a.nota_obtida * a.peso
      })

      const mArr = Object.values(byMat).map((v) => ({
        nome: v.nome,
        media: v.pesoTotal > 0 ? v.notaTotal / v.pesoTotal : 0,
        pct: v.pesoTotal > 0 ? Math.min(100, ((v.notaTotal / v.pesoTotal) / 10) * 100) : 0,
      }))
      mArr.sort((a, b) => b.media - a.media)
      setMedias(mArr)

      const faltaArr: { nome: string; qtd: number; max: number }[] = []
      for (const m of mat.items.slice(0, 5)) {
        const f = await apiGet<PaginatedResponse<Falta>>(`/materias/${m.id}/faltas?page=1&page_size=9999`)
        const total = f.items.reduce((sum, x) => sum + x.quantidade, 0)
        faltaArr.push({ nome: m.nome, qtd: total, max: Math.max(total, 1) })
      }
      setFaltaStats(faltaArr)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <Spinner />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Estatísticas</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Média Ponderada por Matéria</h3>
          {medias.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma avaliação com nota registrada.</p>
          ) : (
            <div className="space-y-3">
              {medias.map((m) => (
                <div key={m.nome}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 truncate">{m.nome}</span>
                    <span className={`font-mono font-medium ${m.media >= 7 ? 'text-green-400' : m.media >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {m.media.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${m.media >= 7 ? 'bg-green-500' : m.media >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Progresso de Tópicos</h3>
          {topicoStats.total === 0 ? (
            <p className="text-sm text-gray-500">Nenhum tópico cadastrado.</p>
          ) : (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{topicoStats.estudados} estudados de {topicoStats.total}</span>
                <span className="text-green-400 font-mono">
                  {Math.round((topicoStats.estudados / topicoStats.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${(topicoStats.estudados / topicoStats.total) * 100}%` }}
                />
              </div>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> Estudados ({topicoStats.estudados})</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-700 rounded" /> Pendentes ({topicoStats.pendentes})</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Faltas por Matéria</h3>
          {faltaStats.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma falta registrada.</p>
          ) : (
            <div className="space-y-3">
              {faltaStats.map((f) => (
                <div key={f.nome}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 truncate">{f.nome}</span>
                    <span className="text-red-400 font-mono">{f.qtd}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="h-2 rounded-full bg-red-500" style={{ width: `${Math.min(100, (f.qtd / 10) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
