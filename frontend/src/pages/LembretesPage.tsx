import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import { useToast } from '../contexts/useToast';
import { useApiList } from '../hooks/useApiList';
import type { Lembrete, Avaliacao, Materia, PaginatedResponse } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import SearchInput from '../components/SearchInput';
import SortableTh from '../components/SortableTh';
import PaginationBar from '../components/PaginationBar';

interface LembreteForm {
  nome: string;
  descricao: string;
  avaliacao_id: number | '';
  data_lembrete: string;
}

const emptyForm: LembreteForm = {
  nome: '',
  descricao: '',
  avaliacao_id: '',
  data_lembrete: '',
};

export default function LembretesPage() {
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
  } = useApiList<Lembrete>('/lembretes', { initialOrdering: 'nome' });

  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<LembreteForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lembrete | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getAvaliacaoLabel = (avId: number) => {
    const av = avaliacoes.find((a) => a.id === avId);
    if (!av) return `#${avId}`;
    const mat = materias.find((m) => m.id === av.materia);
    return mat ? `${av.nome} (${mat.nome})` : av.nome;
  };

  const loadRefs = useCallback(async () => {
    try {
      const [av, mat] = await Promise.all([
        apiGet<PaginatedResponse<Avaliacao>>(
          '/avaliacoes?page=1&page_size=9999'
        ),
        apiGet<PaginatedResponse<Materia>>('/materias?page=1&page_size=9999'),
      ]);
      setAvaliacoes(av.items);
      setMaterias(mat.items);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(l: Lembrete) {
    setForm({
      nome: l.nome,
      descricao: l.descricao ?? '',
      avaliacao_id: l.avaliacao,
      data_lembrete: l.data_lembrete,
    });
    setEditingId(l.id);
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nome: form.nome,
        descricao: form.descricao,
        avaliacao_id: Number(form.avaliacao_id),
        data_lembrete: form.data_lembrete,
      };
      if (editingId) {
        await apiPut<Lembrete>(`/lembretes/${editingId}`, payload);
        toast.addToast('Lembrete atualizado com sucesso', 'success');
      } else {
        await apiPost<Lembrete>('/lembretes', payload);
        toast.addToast('Lembrete criado com sucesso', 'success');
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
      await apiDelete(`/lembretes/${deleteTarget.id}`);
      setDeleteTarget(null);
      toast.addToast('Lembrete excluído com sucesso', 'success');
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
        <h2 className="text-2xl font-bold">Lembretes</h2>
        <button
          onClick={openCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Novo Lembrete
        </button>
      </div>

      <div className="mb-4 max-w-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar lembretes..."
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
              ? 'Nenhum lembrete encontrado.'
              : 'Nenhum lembrete cadastrado.'
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
                  Avaliação
                </th>
                <SortableTh
                  field="data_lembrete"
                  ordering={ordering}
                  onToggle={setOrdering}
                >
                  Data
                </SortableTh>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/50"
                >
                  <td className="px-6 py-3 font-medium">{l.nome}</td>
                  <td className="px-6 py-3 text-sm text-gray-400">
                    {getAvaliacaoLabel(l.avaliacao)}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-400">
                    {new Date(l.data_lembrete).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(l)}
                      className="text-gray-400 hover:text-purple-400 text-sm mr-3 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteTarget(l)}
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
        title={editingId ? 'Editar Lembrete' : 'Novo Lembrete'}
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
            <label className="block text-sm text-gray-400 mb-1">
              Avaliação
            </label>
            <select
              value={form.avaliacao_id}
              onChange={(e) =>
                setForm({ ...form, avaliacao_id: Number(e.target.value) || '' })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              required
            >
              <option value="">Selecione</option>
              {avaliacoes.map((a) => (
                <option key={a.id} value={a.id}>
                  {getAvaliacaoLabel(a.id)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Descrição
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              rows={2}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Data do Lembrete
            </label>
            <input
              type="date"
              value={form.data_lembrete}
              onChange={(e) =>
                setForm({ ...form, data_lembrete: e.target.value })
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
        title="Excluir Lembrete"
        message={`Tem certeza que deseja excluir "${deleteTarget?.nome}"?`}
        loading={deleting}
      />
    </div>
  );
}
