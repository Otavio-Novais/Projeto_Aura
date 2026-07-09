import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '../api'
import type { Avaliacao, Lembrete, PaginatedResponse } from '../types'
import Spinner from '../components/Spinner'

interface CalendarDay {
  day: number
  date: string
  avaliacoes: Avaliacao[]
  lembretes: Lembrete[]
  isToday: boolean
}

function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = firstDay.getDay()
  const days: CalendarDay[] = []

  for (let i = 0; i < start; i++) {
    days.push({ day: 0, date: '', avaliacoes: [], lembretes: [], isToday: false })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dateObj = new Date(year, month, d)
    dateObj.setHours(0, 0, 0, 0)
    days.push({
      day: d,
      date,
      avaliacoes: [],
      lembretes: [],
      isToday: dateObj.getTime() === today.getTime(),
    })
  }

  return days
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [av, lem] = await Promise.all([
        apiGet<PaginatedResponse<Avaliacao>>('/avaliacoes?page=1&page_size=9999'),
        apiGet<PaginatedResponse<Lembrete>>('/lembretes?page=1&page_size=9999'),
      ])
      setAvaliacoes(av.items.filter((a) => a.data_avaliacao))
      setLembretes(lem.items)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const days = getCalendarDays(year, month)
  days.forEach((day) => {
    if (!day.date) return
    day.avaliacoes = avaliacoes.filter((a) => a.data_avaliacao === day.date)
    day.lembretes = lembretes.filter((l) => l.data_lembrete === day.date)
  })

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1) }
    else setMonth(month - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1) }
    else setMonth(month + 1)
  }

  if (loading) return <Spinner />

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Calendário</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="text-gray-400 hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-800 transition-colors">←</button>
          <h3 className="text-lg font-semibold">{MONTHS[month]} {year}</h3>
          <button onClick={nextMonth} className="text-gray-400 hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-800 transition-colors">→</button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
          ))}

          {days.map((d, i) => (
            <div
              key={i}
              className={`min-h-[80px] p-1 rounded-lg border text-sm ${
                d.day === 0
                  ? 'border-transparent'
                  : d.isToday
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              {d.day > 0 && (
                <>
                  <div className={`text-right mb-1 ${d.isToday ? 'font-bold text-purple-400' : 'text-gray-400'}`}>
                    {d.day}
                  </div>
                  <div className="space-y-0.5">
                    {d.avaliacoes.slice(0, 2).map((a) => (
                      <div key={a.id} className="bg-yellow-500/20 text-yellow-400 text-xs px-1 rounded truncate" title={a.nome}>
                        📝 {a.nome}
                      </div>
                    ))}
                    {d.lembretes.slice(0, 2).map((l) => (
                      <div key={l.id} className="bg-red-500/20 text-red-400 text-xs px-1 rounded truncate" title={l.nome}>
                        🔔 {l.nome}
                      </div>
                    ))}
                    {(d.avaliacoes.length + d.lembretes.length) > 4 && (
                      <div className="text-xs text-gray-500">+{d.avaliacoes.length + d.lembretes.length - 4} mais</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-800 text-sm text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500/20 rounded" /> Avaliações</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500/20 rounded" /> Lembretes</span>
        </div>
      </div>
    </div>
  )
}
