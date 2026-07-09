import { useState, useCallback, useEffect, useMemo } from 'react';
import { apiGet } from '../api';
import type { PaginatedResponse } from '../types';

export interface UseApiListOptions {
  pageSize?: number;
  initialOrdering?: string;
}

export interface UseApiListReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  search: string;
  page: number;
  totalPages: number;
  totalCount: number;
  ordering: string;
  setSearch: (v: string) => void;
  setPage: (n: number) => void;
  setOrdering: (field: string) => void;
  reload: () => void;
  setItems: (updater: (prev: T[]) => T[]) => void;
}

export function useApiList<T>(
  endpoint: string,
  opts: UseApiListOptions = {}
): UseApiListReturn<T> {
  const { pageSize = 20, initialOrdering = '' } = opts;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState(initialOrdering);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('page_size', String(pageSize));
      if (search) params.set('search', search);
      if (ordering) params.set('ordering', ordering);

      const data = await apiGet<PaginatedResponse<T>>(
        `${endpoint}?${params.toString()}`
      );
      setItems(data.items);
      setTotalCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, pageSize, search, ordering]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  function toggleOrdering(field: string) {
    setOrdering((prev) => {
      if (prev === field) return `-${field}`;
      if (prev === `-${field}`) return '';
      return field;
    });
  }

  return {
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
    setOrdering: toggleOrdering,
    reload: fetchData,
    setItems,
  };
}
