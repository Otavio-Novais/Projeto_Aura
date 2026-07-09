export interface Curso {
  id: number;
  nome: string;
  data_entrada: string;
  usuario: number;
}

export interface Docente {
  id: number;
  nome: string;
}

export interface Materia {
  id: number;
  nome: string;
  curso: number;
  curso_nome?: string;
  docente: number;
  docente_nome?: string;
}

export interface Falta {
  id: number;
  materia: number;
  data_entrada: string;
  quantidade: number;
}

export interface TecnicaEstudo {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface Topico {
  id: number;
  nome: string;
  materia: number;
  materia_nome?: string;
  tecnica_estudo: number;
  tecnica_estudo_nome?: string;
  data_estimada: string | null;
  data_esperada: string | null;
  estudou: boolean;
  importancia: 'Alta' | 'Media' | 'Baixa';
}

export type TipoAvaliacao = 'Prova' | 'Trabalho' | 'Exercicio' | 'Outro';

export interface Avaliacao {
  id: number;
  nome: string;
  materia: number;
  materia_nome?: string;
  data_entrada: string;
  data_avaliacao: string | null;
  peso: number;
  nota_maxima: number;
  nota_obtida: number | null;
  tipo_avaliacao: TipoAvaliacao;
}

export interface Lembrete {
  id: number;
  nome: string;
  descricao: string | null;
  data_entrada: string;
  data_lembrete: string;
  avaliacao: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
}
