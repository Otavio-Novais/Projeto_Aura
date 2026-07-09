import { useState, useEffect, useRef, useCallback } from 'react'
import { apiGet, apiPost } from '../api'
import { useToast } from '../contexts/useToast'
import type { Topico, Materia, PaginatedResponse } from '../types'
import Spinner from '../components/Spinner'

interface SessaoRecord {
  id: number
  topico: number
  duracao_minutos: number
  data: string
}

const WORK_TIME = 25 * 60
const BREAK_TIME = 5 * 60

export default function PomodoroPage() {
  const toast = useToast()
  const [topicos, setTopicos] = useState<Topico[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTopico, setSelectedTopico] = useState<number | ''>('')
  const [recentSessions, setRecentSessions] = useState<SessaoRecord[]>([])

  const [seconds, setSeconds] = useState(WORK_TIME)
  const [running, setRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [top, mat, ses] = await Promise.all([
        apiGet<PaginatedResponse<Topico>>('/topicos?page=1&page_size=9999'),
        apiGet<PaginatedResponse<Materia>>('/materias?page=1&page_size=9999'),
        apiGet<SessaoRecord[]>('/sessoes'),
      ])
      setTopicos(top.items.filter((t) => !t.estudou))
      setMaterias(mat.items)
      setRecentSessions(ses)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function getTopicoLabel(id: number) {
    const t = topicos.find((x) => x.id === id)
    if (!t) return `#${id}`
    const m = materias.find((x) => x.id === t.materia)
    return m ? `${t.nome} (${m.nome})` : t.nome
  }

  function toggleTimer() {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setRunning(false)
    } else {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            setRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      setRunning(true)
    }
  }

  function resetTimer(type: 'work' | 'break' = 'work') {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setIsBreak(type === 'break')
    setSeconds(type === 'break' ? BREAK_TIME : WORK_TIME)
  }

  async function registerSession() {
    if (!selectedTopico) {
      toast.addToast('Selecione um tópico primeiro', 'error')
      return
    }
    const minutes = Math.round((WORK_TIME - seconds) / 60)
    if (minutes < 1) {
      toast.addToast('Sessão muito curta para registrar', 'error')
      return
    }
    try {
      await apiPost('/sessoes', { topico_id: Number(selectedTopico), duracao_minutos: minutes })
      toast.addToast(`Sessão de ${minutes}min registrada!`, 'success')
      setRecentSessions((prev) => [
        { id: Date.now(), topico: Number(selectedTopico), duracao_minutos: minutes, data: new Date().toISOString() },
        ...prev,
      ])
      resetTimer()
    } catch (err) {
      toast.addToast(err instanceof Error ? err.message : 'Erro ao registrar', 'error')
    }
  }

  const min = String(Math.floor(seconds / 60)).padStart(2, '0')
  const sec = String(seconds % 60).padStart(2, '0')

  if (loading) return <Spinner />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Pomodoro</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center">
          <div className={`text-6xl font-mono font-bold mb-6 tracking-wider ${isBreak ? 'text-green-400' : 'text-purple-400'}`}>
            {min}:{sec}
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => resetTimer('work')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${!isBreak ? 'bg-purple-600/30 text-purple-400' : 'text-gray-500 hover:bg-gray-800'}`}
            >
              Foco (25)
            </button>
            <button
              onClick={() => resetTimer('break')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${isBreak ? 'bg-green-600/30 text-green-400' : 'text-gray-500 hover:bg-gray-800'}`}
            >
              Pausa (5)
            </button>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={toggleTimer}
              className={`px-6 py-2 rounded-lg font-medium transition-colors text-white ${running ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {running ? 'Pausar' : 'Iniciar'}
            </button>
            <button onClick={registerSession} disabled={running || seconds === WORK_TIME} className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white font-medium transition-colors">
              Registrar
            </button>
          </div>

          <div className="w-full max-w-xs">
            <label className="block text-sm text-gray-400 mb-1">Tópico de estudo</label>
            <select value={selectedTopico} onChange={(e) => setSelectedTopico(Number(e.target.value) || '')} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-purple-500 transition-colors">
              <option value="">Selecione um tópico pendente</option>
              {topicos.map((t) => (
                <option key={t.id} value={t.id}>{getTopicoLabel(t.id)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Sessões Recentes</h3>
          {recentSessions.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma sessão registrada.</p>
          ) : (
            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
              {recentSessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2 border-b border-gray-800/50 text-sm">
                  <span className="text-gray-300 truncate flex-1">{getTopicoLabel(s.topico)}</span>
                  <span className="text-purple-400 font-mono ml-2">{s.duracao_minutos}min</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
