import { useState, type FormEvent } from 'react';
import { apiPost, apiPut, apiDelete } from '../api';
import { useToast } from '../contexts/useToast';
import { useApiList } from '../hooks/useApiList';
import type { TecnicaEstudo } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import SearchInput from '../components/SearchInput';
import SortableTh from '../components/SortableTh';
import PaginationBar from '../components/PaginationBar';
import FormField from '../components/FormField';
import { inputClass } from '../components/inputClass';

interface TecnicaForm {
  nome: string;
  descricao: string;
}

const emptyForm: TecnicaForm = { nome: '', descricao: '' };

export default function TecnicasEstudoPage() {
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
  } = useApiList<TecnicaEstudo>('/tecnicas-estudo', {
    initialOrdering: 'nome',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<TecnicaForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TecnicaEstudo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório';
    if (!form.descricao.trim()) e.descricao = 'Descrição é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function openCreate() {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(t: TecnicaEstudo) {
    setForm({ nome: t.nome, descricao: t.descricao ?? '' });
    setErrors({});
    setEditingId(t.id);
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId) {
        await apiPut<TecnicaEstudo>(`/tecnicas-estudo/${editingId}`, form);
        toast.addToast('Técnica atualizada com sucesso', 'success');
      } else {
        await apiPost<TecnicaEstudo>('/tecnicas-estudo', form);
        toast.addToast('Técnica criada com sucesso', 'success');
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
      await apiDelete(`/tecnicas-estudo/${deleteTarget.id}`);
      setDeleteTarget(null);
      toast.addToast('Técnica excluída com sucesso', 'success');
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
        <h2 className="text-2xl font-bold">Técnicas de Estudo</h2>
        <button
          onClick={openCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nova Técnica
        </button>
      </div>

      <div className="mb-4 max-w-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar técnicas..."
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
              ? 'Nenhuma técnica encontrada.'
              : 'Nenhuma técnica cadastrada.'
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
                  Descrição
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/50"
                >
                  <td className="px-6 py-3 font-medium">{t.nome}</td>
                  <td className="px-6 py-3 text-sm text-gray-400 max-w-xs truncate">
                    {t.descricao || '—'}
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
        title={editingId ? 'Editar Técnica' : 'Nova Técnica'}
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
          <FormField label="Descrição" error={errors.descricao}>
            <textarea
              value={form.descricao}
              onChange={(e) => {
                setForm({ ...form, descricao: e.target.value });
                if (errors.descricao) setErrors({});
              }}
              className={`${inputClass(errors.descricao)} resize-none`}
              rows={3}
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
        title="Excluir Técnica"
        message={`Tem certeza que deseja excluir "${deleteTarget?.nome}"?`}
        loading={deleting}
      />
    </div>
  );
}
