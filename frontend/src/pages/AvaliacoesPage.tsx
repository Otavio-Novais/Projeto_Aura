import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import { useToast } from '../contexts/useToast';
import { useApiList } from '../hooks/useApiList';
import type {
  Avaliacao,
  Materia,
  TipoAvaliacao,
  PaginatedResponse,
} from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import SearchInput from '../components/SearchInput';
import SortableTh from '../components/SortableTh';
import PaginationBar from '../components/PaginationBar';

const TIPOS: TipoAvaliacao[] = ['Prova', 'Trabalho', 'Exercicio', 'Outro'];

interface AvaliacaoForm {
  nome: string;
  materia_id: number | '';
  data_avaliacao: string;
  peso: number;
  tipo_avaliacao: TipoAvaliacao;
  nota_maxima: number;
  nota_obtida: number | '';
}

const emptyForm: AvaliacaoForm = {
  nome: '',
  materia_id: '',
  data_avaliacao: '',
  peso: 1,
  tipo_avaliacao: 'Prova',
  nota_maxima: 10,
  nota_obtida: '',
};

export default function AvaliacoesPage() {
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
  } = useApiList<Avaliacao>('/avaliacoes', { initialOrdering: 'nome' });

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [cursosList, setCursosList] = useState<Record<number, string>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AvaliacaoForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Avaliacao | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRefs = useCallback(async () => {
    try {
      const [mat, cursos] = await Promise.all([
        apiGet<PaginatedResponse<Materia>>('/materias?page=1&page_size=9999'),
        apiGet<PaginatedResponse<{ id: number; nome: string }>>(
          '/cursos?page=1&page_size=9999'
        ),
      ]);
      setMaterias(mat.items);
      const nomes: Record<number, string> = {};
      cursos.items.forEach((c) => {
        nomes[c.id] = c.nome;
      });
      setCursosList(nomes);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  function getMateriaLabel(materia: Materia) {
    const p = cursosList[materia.curso];
    return p ? `${p} — ${materia.nome}` : materia.nome;
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(av: Avaliacao) {
    setForm({
      nome: av.nome,
      materia_id: av.materia,
      data_avaliacao: av.data_avaliacao ?? '',
      peso: av.peso,
      tipo_avaliacao: av.tipo_avaliacao,
      nota_maxima: av.nota_maxima,
      nota_obtida: av.nota_obtida ?? '',
    });
    setEditingId(av.id);
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nome: form.nome,
        materia_id: Number(form.materia_id),
        data_avaliacao: form.data_avaliacao || null,
        peso: form.peso,
        tipo_avaliacao: form.tipo_avaliacao,
        nota_maxima: form.nota_maxima,
        nota_obtida: form.nota_obtida === '' ? null : Number(form.nota_obtida),
      };
      if (editingId) {
        await apiPut<Avaliacao>(`/avaliacoes/${editingId}`, payload);
        toast.addToast('Avaliação atualizada com sucesso', 'success');
      } else {
        await apiPost<Avaliacao>('/avaliacoes', payload);
        toast.addToast('Avaliação criada com sucesso', 'success');
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
      await apiDelete(`/avaliacoes/${deleteTarget.id}`);
      setDeleteTarget(null);
      toast.addToast('Avaliação excluída com sucesso', 'success');
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
        <h2 className="text-2xl font-bold">Avaliações</h2>
        <button
          onClick={openCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nova Avaliação
        </button>
      </div>

      <div className="mb-4 max-w-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar avaliações..."
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
              ? 'Nenhuma avaliação encontrada.'
              : 'Nenhuma avaliação cadastrada.'
          }
        />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
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
                    Matéria
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Tipo
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Nota
                  </th>
                  <SortableTh
                    field="data_avaliacao"
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
                {items.map((av) => {
                  const mat = materias.find((m) => m.id === av.materia);
                  const nota =
                    av.nota_obtida != null
                      ? `${av.nota_obtida}/${av.nota_maxima}`
                      : `0/${av.nota_maxima}`;
                  return (
                    <tr
                      key={av.id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-3 font-medium">{av.nome}</td>
                      <td className="px-6 py-3 text-sm text-gray-400">
                        {mat ? getMateriaLabel(mat) : `#${av.materia}`}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className="bg-gray-800 rounded-full px-2 py-0.5 text-xs text-gray-300">
                          {av.tipo_avaliacao}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-400">
                        {nota} (peso {av.peso})
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-400">
                        {av.data_avaliacao
                          ? new Date(av.data_avaliacao).toLocaleDateString(
                              'pt-BR'
                            )
                          : '—'}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => openEdit(av)}
                          className="text-gray-400 hover:text-purple-400 text-sm mr-3 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteTarget(av)}
                          className="text-gray-400 hover:text-red-400 text-sm transition-colors"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
        title={editingId ? 'Editar Avaliação' : 'Nova Avaliação'}
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
                  {getMateriaLabel(m)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo</label>
              <select
                value={form.tipo_avaliacao}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tipo_avaliacao: e.target.value as TipoAvaliacao,
                  })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Data</label>
              <input
                type="date"
                value={form.data_avaliacao}
                onChange={(e) =>
                  setForm({ ...form, data_avaliacao: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Peso</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.peso}
                onChange={(e) =>
                  setForm({ ...form, peso: Number(e.target.value) || 0 })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Nota Máx.
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.nota_maxima}
                onChange={(e) =>
                  setForm({ ...form, nota_maxima: Number(e.target.value) || 0 })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Nota Obtida
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.nota_obtida === '' ? '' : form.nota_obtida}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nota_obtida:
                      e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
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
        title="Excluir Avaliação"
        message={`Tem certeza que deseja excluir "${deleteTarget?.nome}"?`}
        loading={deleting}
      />
    </div>
  );
}
