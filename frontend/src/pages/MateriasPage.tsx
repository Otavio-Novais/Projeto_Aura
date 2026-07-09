import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import { useToast } from '../contexts/useToast';
import { useApiList } from '../hooks/useApiList';
import type { Materia, Curso, Docente, Avaliacao, PaginatedResponse } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import SearchInput from '../components/SearchInput';
import SortableTh from '../components/SortableTh';
import PaginationBar from '../components/PaginationBar';
import FormField from '../components/FormField';
import { inputClass } from '../components/inputClass';

interface MateriaForm {
  nome: string;
  curso: number | '';
  docente: number | '';
}

const emptyForm: MateriaForm = { nome: '', curso: '', docente: '' };

export default function MateriasPage() {
  const toast = useToast();
  const {
    items,
    loading,
    error,
    search,
    page,
    totalPages,
    totalCount,
    ordering,
    setSearch,
    setPage,
    setOrdering,
    reload,
  } = useApiList<Materia>('/materias', { initialOrdering: 'nome' });

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [medias, setMedias] = useState<Record<number, string>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<MateriaForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Materia | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório';
    if (!form.curso) e.curso = 'Curso é obrigatório';
    if (!form.docente) e.docente = 'Docente é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const getCursoNome = (cursoId: number) =>
    cursos.find((c) => c.id === cursoId)?.nome ?? `#${cursoId}`;

  const getDocenteNome = (docenteId: number) =>
    docentes.find((d) => d.id === docenteId)?.nome ?? `#${docenteId}`;

  const loadRefs = useCallback(async () => {
    try {
      const [c, d, av] = await Promise.all([
        apiGet<PaginatedResponse<Curso>>('/cursos?page=1&page_size=9999'),
        apiGet<PaginatedResponse<Docente>>('/docentes?page=1&page_size=9999'),
        apiGet<PaginatedResponse<Avaliacao>>('/avaliacoes?page=1&page_size=9999'),
      ]);
      setCursos(c.items);
      setDocentes(d.items);

      const calc: Record<number, string> = {};
      const byMateria: Record<number, { pesoTotal: number; notaTotal: number }> = {};
      av.items.forEach((a) => {
        if (a.nota_obtida == null) return;
        if (!byMateria[a.materia]) byMateria[a.materia] = { pesoTotal: 0, notaTotal: 0 };
        byMateria[a.materia].pesoTotal += a.peso;
        byMateria[a.materia].notaTotal += a.nota_obtida * a.peso;
      });
      Object.entries(byMateria).forEach(([mId, v]) => {
        calc[Number(mId)] = v.pesoTotal > 0 ? (v.notaTotal / v.pesoTotal).toFixed(1) : '—';
      });
      setMedias(calc);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  function openCreate() {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(materia: Materia) {
    setForm({
      nome: materia.nome,
      curso: materia.curso,
      docente: materia.docente,
    });
    setErrors({});
    setEditingId(materia.id);
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        nome: form.nome,
        curso: Number(form.curso),
        docente: Number(form.docente),
      };
      if (editingId) {
        await apiPut<Materia>(`/materias/${editingId}`, payload);
        toast.addToast('Matéria atualizada com sucesso', 'success');
      } else {
        await apiPost<Materia>('/materias', payload);
        toast.addToast('Matéria criada com sucesso', 'success');
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      toast.addToast(
        err instanceof Error ? err.message : 'Erro ao salvar',
        'error'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/materias/${deleteTarget.id}`);
      setDeleteTarget(null);
      toast.addToast('Matéria excluída com sucesso', 'success');
      reload();
    } catch (err) {
      toast.addToast(
        err instanceof Error ? err.message : 'Erro ao excluir',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  }

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

      <div className="mb-4 max-w-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar matérias..."
        />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState
          message={
            search
              ? 'Nenhuma matéria encontrada.'
              : 'Nenhuma matéria cadastrada.'
          }
        />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <SortableTh
                  field="nome"
                  ordering={ordering}
                  onToggle={setOrdering}
                >
                  Nome
                </SortableTh>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Curso
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Docente
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Média
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
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
                  <td className="px-6 py-3 text-sm">
                    <span className={`font-mono font-medium ${medias[m.id] && Number(medias[m.id]) >= 7 ? 'text-green-400' : medias[m.id] && Number(medias[m.id]) >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {medias[m.id] || '—'}
                    </span>
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
          <div className="px-6 py-3">
            <PaginationBar
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Matéria' : 'Nova Matéria'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Nome" error={errors.nome}>
            <input
              value={form.nome}
              onChange={(e) => {
                setForm({ ...form, nome: e.target.value });
                if (errors.nome) setErrors({});
              }}
              className={inputClass(errors.nome)}
              autoFocus
            />
          </FormField>
          <FormField label="Curso" error={errors.curso}>
            <select
              value={form.curso}
              onChange={(e) => {
                setForm({ ...form, curso: Number(e.target.value) || '' });
                if (errors.curso) setErrors({});
              }}
              className={inputClass(errors.curso)}
            >
              <option value="">Selecione um curso</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Docente" error={errors.docente}>
            <select
              value={form.docente}
              onChange={(e) => {
                setForm({ ...form, docente: Number(e.target.value) || '' });
                if (errors.docente) setErrors({});
              }}
              className={inputClass(errors.docente)}
            >
              <option value="">Selecione um docente</option>
              {docentes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </FormField>
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
  );
}
