import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'
import type { Falta, Materia } from '../types'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

interface FaltaForm {
  materia: number | ''
  quantidade: number
}

const emptyForm: FaltaForm = { materia: '', quantidade: 1 }

export default function FaltasPage() {
  const [faltas, setFaltas] = useState<Falta[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [selectedMateriaId, setSelectedMateriaId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FaltaForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Falta | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getMateriaNome = (id: number) =>
    materias.find((m) => m.id === id)?.nome ?? `#${id}`

  const loadMaterias = useCallback(async () => {
    try {
      const m = await apiGet<Materia[]>('/materias')
      setMaterias(m)
    } catch {
      // silent
    }
  }, [])

  const loadFaltas = useCallback(async (materiaId: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<Falta[]>(`/materias/${materiaId}/faltas`)
      setFaltas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMaterias()
  }, [loadMaterias])

  useEffect(() => {
    if (selectedMateriaId) {
      loadFaltas(selectedMateriaId)
    } else {
      setFaltas([])
      setLoading(false)
    }
  }, [selectedMateriaId, loadFaltas])

  function openCreate() {
    setForm({ materia: selectedMateriaId || '', quantidade: 1 })
    setEditingId(null)
    setModalOpen(true)
  }

  function openEdit(falta: Falta) {
    setForm({ materia: falta.materia, quantidade: falta.quantidade })
    setEditingId(falta.id)
    setModalOpen(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!form.materia) return
    setSaving(true)
    try {
      const materiaId = Number(form.materia)
      const payload = { materia: materiaId }
      if (editingId) {
        await apiPut<Falta>(`/faltas/${editingId}`, payload)
      } else {
        await apiPost<Falta>(`/materias/${materiaId}/faltas`, payload)
      }
      setModalOpen(false)
      if (materiaId === selectedMateriaId) {
        await loadFaltas(materiaId)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiDelete(`/faltas/${deleteTarget.id}`)
      setDeleteTarget(null)
      if (selectedMateriaId) {
        await loadFaltas(selectedMateriaId)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Faltas</h2>
        {selectedMateriaId && (
          <button
            onClick={openCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Registrar Falta
          </button>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">
          Filtrar por Matéria
        </label>
        <select
          value={selectedMateriaId ?? ''}
          onChange={(e) =>
            setSelectedMateriaId(
              e.target.value ? Number(e.target.value) : null,
            )
          }
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors w-full max-w-xs"
        >
          <option value="">Selecione uma matéria</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>

      {!selectedMateriaId ? (
        <EmptyState message="Selecione uma matéria para ver as faltas." />
      ) : loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : faltas.length === 0 ? (
        <EmptyState message="Nenhuma falta registrada para esta matéria." />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Matéria
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Quantidade
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Data
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {faltas.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/50"
                >
                  <td className="px-6 py-3 text-sm">
                    {getMateriaNome(f.materia)}
                  </td>
                  <td className="px-6 py-3 font-medium">{f.quantidade}</td>
                  <td className="px-6 py-3 text-sm text-gray-400">
                    {new Date(f.data_entrada).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(f)}
                      className="text-gray-400 hover:text-purple-400 text-sm mr-3 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteTarget(f)}
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
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Falta' : 'Registrar Falta'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Matéria</label>
            <select
              value={form.materia}
              onChange={(e) =>
                setForm({ ...form, materia: Number(e.target.value) || '' })
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
              Quantidade
            </label>
            <input
              type="number"
              min="1"
              value={form.quantidade}
              onChange={(e) =>
                setForm({ ...form, quantidade: Number(e.target.value) || 1 })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
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
        title="Excluir Falta"
        message="Tem certeza que deseja excluir este registro de falta?"
        loading={deleting}
      />
    </div>
  )
}
