import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '../api'
import type { Materia, Curso, Docente } from '../types'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

interface MateriaForm {
  nome: string
  curso: number | ''
  docente: number | ''
}

const emptyForm: MateriaForm = { nome: '', curso: '', docente: '' }

export default function MateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<MateriaForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Materia | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getCursoNome = (cursoId: number) =>
    cursos.find((c) => c.id === cursoId)?.nome ?? `Curso #${cursoId}`

  const getDocenteNome = (docenteId: number) =>
    docentes.find((d) => d.id === docenteId)?.nome ?? `Docente #${docenteId}`

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [m, c, d] = await Promise.all([
        apiGet<Materia[]>('/materias'),
        apiGet<Curso[]>('/cursos'),
        apiGet<Docente[]>('/docentes'),
      ])
      setMaterias(m)
      setCursos(c)
      setDocentes(d)
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

  function openEdit(materia: Materia) {
    setForm({
      nome: materia.nome,
      curso: materia.curso,
      docente: materia.docente,
    })
    setEditingId(materia.id)
    setModalOpen(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { nome: form.nome, curso: Number(form.curso), docente: Number(form.docente) }
      if (editingId) {
        await apiPut<Materia>(`/materias/${editingId}`, payload)
      } else {
        await apiPost<Materia>('/materias', payload)
      }
      setModalOpen(false)
      await load()
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
      await apiDelete(`/materias/${deleteTarget.id}`)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner />
  if (error) return <p className="text-red-400">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Matérias</h2>
        <button
          onClick={openCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nova Matéria
        </button>
      </div>

      {materias.length === 0 ? (
        <EmptyState message="Nenhuma matéria cadastrada." />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Nome
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Curso
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Docente
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {materias.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/50"
                >
                  <td className="px-6 py-3 font-medium">{m.nome}</td>
                  <td className="px-6 py-3 text-sm text-gray-400">
                    {getCursoNome(m.curso)}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-400">
                    {getDocenteNome(m.docente)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(m)}
                      className="text-gray-400 hover:text-purple-400 text-sm mr-3 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteTarget(m)}
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
        title={editingId ? 'Editar Matéria' : 'Nova Matéria'}
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
            <label className="block text-sm text-gray-400 mb-1">Curso</label>
            <select
              value={form.curso}
              onChange={(e) => setForm({ ...form, curso: Number(e.target.value) || '' })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              required
            >
              <option value="">Selecione um curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Docente</label>
            <select
              value={form.docente}
              onChange={(e) => setForm({ ...form, docente: Number(e.target.value) || '' })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              required
            >
              <option value="">Selecione um docente</option>
              {docentes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
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
        title="Excluir Matéria"
        message={`Tem certeza que deseja excluir "${deleteTarget?.nome}"?`}
        loading={deleting}
      />
    </div>
  )
}
