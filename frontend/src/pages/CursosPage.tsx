import { useState, type FormEvent } from 'react';
import { apiPost, apiPut, apiDelete } from '../api';
import { useToast } from '../contexts/useToast';
import { useApiList } from '../hooks/useApiList';
import type { Curso } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import SearchInput from '../components/SearchInput';
import SortableTh from '../components/SortableTh';
import PaginationBar from '../components/PaginationBar';
import FormField from '../components/FormField';
import { inputClass } from '../components/inputClass';

interface CursoForm {
  nome: string;
}

const emptyForm: CursoForm = { nome: '' };

export default function CursosPage() {
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
  } = useApiList<Curso>('/cursos', { initialOrdering: 'nome' });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CursoForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Curso | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function openCreate() {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(curso: Curso) {
    setForm({ nome: curso.nome });
    setErrors({});
    setEditingId(curso.id);
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId) {
        await apiPut<Curso>(`/cursos/${editingId}`, form);
        toast.addToast('Curso atualizado com sucesso', 'success');
      } else {
        await apiPost<Curso>('/cursos', form);
        toast.addToast('Curso criado com sucesso', 'success');
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
      await apiDelete(`/cursos/${deleteTarget.id}`);
      setDeleteTarget(null);
      toast.addToast('Curso excluído com sucesso', 'success');
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
        <h2 className="text-2xl font-bold">Cursos</h2>
        <button
          onClick={openCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Curso
        </button>
      </div>

      <div className="mb-4 max-w-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar cursos..."
        />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : items.length === 0 ? (
        <EmptyState
          message={
            search ? 'Nenhum curso encontrado.' : 'Nenhum curso cadastrado.'
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
                  Adicionado em
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((curso) => (
                <tr
                  key={curso.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/50"
                >
                  <td className="px-6 py-3 font-medium">{curso.nome}</td>
                  <td className="px-6 py-3 text-sm text-gray-400">
                    {new Date(curso.data_entrada).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(curso)}
                      className="text-gray-400 hover:text-purple-400 text-sm mr-3 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteTarget(curso)}
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
        title={editingId ? 'Editar Curso' : 'Novo Curso'}
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
        title="Excluir Curso"
        message={`Tem certeza que deseja excluir "${deleteTarget?.nome}"?`}
        loading={deleting}
      />
    </div>
  );
}
