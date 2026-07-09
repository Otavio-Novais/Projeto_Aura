import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'
import { useToast } from '../contexts/useToast'
import type { Topico, Materia, TecnicaEstudo } from '../types'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

const IMPORTANCIAS = ['Alta', 'Media', 'Baixa'] as const

interface TopicoForm {
  nome: string
  materia_id: number | ''
  tecnica_estudo_id: number | ''
  data_estimada: string
  data_esperada: string
  estudou: boolean
  importancia: string
}

const emptyForm: TopicoForm = {
  nome: '',
  materia_id: '',
  tecnica_estudo_id: '',
  data_estimada: '',
  data_esperada: '',
  estudou: false,
  importancia: 'Media',
}

export default function TopicosPage() {
  const toast = useToast()
  const [topicos, setTopicos] = useState<Topico[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [tecnicas, setTecnicas] = useState<TecnicaEstudo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<TopicoForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Topico | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getMateriaNome = (id: number) =>
    materias.find((m) => m.id === id)?.nome ?? `#${id}`

  const getTecnicaNome = (id: number) =>
    tecnicas.find((t) => t.id === id)?.nome ?? `#${id}`

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [top, mat, tec] = await Promise.all([
        apiGet<Topico[]>('/topicos'),
        apiGet<Materia[]>('/materias'),
        apiGet<TecnicaEstudo[]>('/tecnicas-estudo'),
      ])
      setTopicos(top)
      setMaterias(mat)
      setTecnicas(tec)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(t: Topico) {
    setForm({
      nome: t.nome,
      materia_id: t.materia,
      tecnica_estudo_id: t.tecnica_estudo,
      data_estimada: t.data_estimada ?? '',
      data_esperada: t.data_esperada ?? '',
      estudou: t.estudou,
      importancia: t.importancia,
    })
    setEditingId(t.id)
    setModalOpen(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        nome: form.nome,
        materia_id: Number(form.materia_id),
        tecnica_estudo_id: Number(form.tecnica_estudo_id),
        data_estimada: form.data_estimada || null,
        data_esperada: form.data_esperada || null,
        estudou: form.estudou,
        importancia: form.importancia,
      }
      if (editingId) {
        await apiPut<Topico>(`/topicos/${editingId}`, payload)
        toast.addToast('Tópico atualizado com sucesso', 'success')
      } else {
        await apiPost<Topico>('/topicos', payload)
        toast.addToast('Tópico criado com sucesso', 'success')
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      toast.addToast(err instanceof Error ? err.message : 'Erro ao salvar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiDelete(`/topicos/${deleteTarget.id}`)
      setDeleteTarget(null)
      toast.addToast('Tópico excluído com sucesso', 'success')
      await load()
    } catch (err) {
      toast.addToast(err instanceof Error ? err.message : 'Erro ao excluir', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner />
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Tópicos</h2>
        <button
          onClick={openCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Tópico
        </button>
      </div>

      {topicos.length === 0 ? (
        <EmptyState message="Nenhum tópico cadastrado." />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Nome
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Matéria
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Técnica
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Importância
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Estudou
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {topicos.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-3 font-medium">{t.nome}</td>
                    <td className="px-6 py-3 text-sm text-gray-400">
                      {getMateriaNome(t.materia)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-400">
                      {getTecnicaNome(t.tecnica_estudo)}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          t.importancia === 'Alta'
                            ? 'bg-red-500/20 text-red-400'
                            : t.importancia === 'Media'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {t.importancia}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {t.estudou ? (
                        <span className="text-green-400">Sim</span>
                      ) : (
                        <span className="text-gray-500">Não</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => openEdit(t)}
                        className="text-gray-400 hover:text-purple-400 text-sm mr-3 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="text-gray-400 hover:text-red-400 text-sm transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Tópico' : 'Novo Tópico'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome</label>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Matéria</label>
            <select
              value={form.materia_id}
              onChange={(e) =>
                setForm({ ...form, materia_id: Number(e.target.value) || '' })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              required
            >
              <option value="">Selecione uma matéria</option>
              {materias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Técnica de Estudo
            </label>
            <select
              value={form.tecnica_estudo_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  tecnica_estudo_id: Number(e.target.value) || '',
                })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              required
            >
              <option value="">Selecione uma técnica</option>
              {tecnicas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Data Estimada
              </label>
              <input
                type="date"
                value={form.data_estimada}
                onChange={(e) =>
                  setForm({ ...form, data_estimada: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Data Esperada
              </label>
              <input
                type="date"
                value={form.data_esperada}
                onChange={(e) =>
                  setForm({ ...form, data_esperada: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Importância
              </label>
              <select
                value={form.importancia}
                onChange={(e) =>
                  setForm({ ...form, importancia: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              >
                {IMPORTANCIAS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.estudou}
                  onChange={(e) =>
                    setForm({ ...form, estudou: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Já estudou</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir Tópico"
        message={`Tem certeza que deseja excluir "${deleteTarget?.nome}"?`}
        loading={deleting}
      />
    </div>
  )
}
