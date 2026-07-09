# Projeto Aura — Gerenciador de Estudos

Aplicação web para estudantes organizarem sua vida acadêmica: cursos, matérias, avaliações, faltas, tópicos de estudo, lembretes e sessões de estudo com timer Pomodoro.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19 + TypeScript + Tailwind CSS + Vite |
| **Backend** | Django 6 + Django Ninja (REST API) |
| **Banco** | SQLite (dev) / PostgreSQL (produção via Docker) |
| **Testes** | pytest + pytest-django / vitest + Testing Library |
| **CI/CD** | GitHub Actions |
| **Containerização** | Docker + docker-compose |

---

## Arquitetura

```
┌──────────────────────┐         ┌──────────────────────┐         ┌──────────┐
│   React SPA (Vite)   │  JSON   │   Django Ninja API   │  ORM    │ SQLite / │
│   Nginx (prod)       │◄───────►│   (Django 6)         │◄───────►│ Postgres │
│   Porta :80 / :5173  │   API   │   Porta :8000        │         │          │
└──────────────────────┘         └──────────────────────┘         └──────────┘
      SPA + auth                     REST + sessão                    DB
```

- Frontend se comunica com o backend via REST (credentials: include para cookies de sessão)
- Autenticação por sessão Django com CSRF
- Proxy reverso Nginx (produção) encaminha `/api/` e `/admin/` para o backend

---

## Estrutura do Projeto

```
Projeto_Aura/
├── .github/workflows/ci.yml          # CI/CD
├── docker-compose.yml                # Orquestração Docker
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── pytest.ini
│   ├── core/                         # Configuração Django
│   │   ├── settings.py
│   │   └── urls.py
│   └── estudos/                      # App principal
│       ├── models.py                 # 9 modelos
│       ├── schemas.py                # Schemas Pydantic (entrada/saída)
│       ├── api.py                    # Instância NinjaAPI + exception handlers
│       ├── admin.py                  # Registro no Django Admin
│       ├── routers/                  # Endpoints modularizados
│       │   ├── auth.py               # Login, registro, perfil, senha
│       │   ├── cursos.py             # CRUD Cursos
│       │   ├── docentes.py           # CRUD Docentes
│       │   ├── materias.py           # CRUD Matérias
│       │   ├── avaliacoes.py         # CRUD Avaliações
│       │   ├── topicos.py            # CRUD Tópicos
│       │   ├── faltas.py             # CRUD Faltas (aninhado em matérias)
│       │   ├── lembretes.py          # CRUD Lembretes
│       │   ├── tecnicas_estudo.py    # CRUD Técnicas de estudo
│       │   └── sessoes.py            # CRUD Sessões de estudo
│       ├── tests/                    # Testes backend
│       │   ├── conftest.py           # Fixtures reutilizáveis
│       │   ├── test_models.py        # 15 testes de modelo
│       │   ├── test_auth.py          # 11 testes de autenticação
│       │   └── test_routers.py       # 31 testes de endpoints
│       └── migrations/
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.js
    └── src/
        ├── api.ts                    # Cliente HTTP (CSRF + erros)
        ├── types.ts                  # Tipos TypeScript das entidades
        ├── App.tsx                   # Rotas + providers
        ├── main.tsx                  # Entrypoint
        ├── contexts/
        │   ├── AuthContext.tsx       # Provider de autenticação
        │   ├── useAuth.ts            # Hook useAuth
        │   ├── ToastContext.tsx      # Provider de notificações
        │   └── useToast.ts           # Hook useToast
        ├── hooks/
        │   └── useApiList.ts         # Hook reutilizável de listagem paginada
        ├── components/
        │   ├── Layout.tsx            # Sidebar responsiva + header mobile
        │   ├── Modal.tsx             # Modal reutilizável
        │   ├── ConfirmDialog.tsx     # Diálogo de confirmação
        │   ├── PaginationBar.tsx     # Controles de paginação
        │   ├── SearchInput.tsx       # Campo de busca
        │   ├── SortableTh.tsx        # Cabeçalho de tabela ordenável
        │   ├── FormField.tsx         # Campo de formulário com erro inline
        │   ├── Spinner.tsx           # Loading spinner
        │   ├── EmptyState.tsx        # Estado vazio
        │   ├── ErrorBoundary.tsx     # Captura de erros de renderização
        │   ├── inputClass.ts         # Função de estilo de input
        │   └── __tests__/            # Testes de componentes (20 testes)
        └── pages/
            ├── DashboardPage.tsx     # Dashboard com cards + próximos eventos
            ├── LoginPage.tsx         # Login
            ├── RegisterPage.tsx      # Registro
            ├── CursosPage.tsx        # CRUD Cursos
            ├── DocentesPage.tsx      # CRUD Docentes
            ├── MateriasPage.tsx      # CRUD Matérias + calculadora de notas
            ├── AvaliacoesPage.tsx    # CRUD Avaliações
            ├── TopicosPage.tsx       # CRUD Tópicos
            ├── FaltasPage.tsx        # Faltas por matéria
            ├── LembretesPage.tsx     # CRUD Lembretes
            ├── TecnicasEstudoPage.tsx # CRUD Técnicas de estudo
            ├── ProfilePage.tsx       # Perfil + alterar senha
            ├── CalendarPage.tsx      # Calendário mensal
            ├── StatsPage.tsx         # Gráficos de progresso
            └── PomodoroPage.tsx      # Timer Pomodoro
```

---

## Funcionalidades

### Autenticação
- Registro de conta (usuário + senha + email opcional)
- Login/logout com sessão Django
- Perfil do usuário (alterar email e senha)
- Proteção de rotas (redirecionamento para login)

### CRUD completo (9 entidades)
| Entidade | Descrição | Escopo |
|----------|-----------|--------|
| Curso | Disciplina acadêmica | Por usuário |
| Docente | Professor | Global (compartilhado) |
| Matéria | Disciplina vinculada a curso + docente | Por usuário |
| Avaliação | Prova, trabalho, exercício | Por usuário |
| Falta | Registro de ausências | Por matéria |
| Tópico | Assunto a estudar com técnica e datas | Por usuário |
| Lembrete | Nota vinculada a avaliação com data | Por usuário |
| Técnica de Estudo | Método de estudo | Global (compartilhado) |
| Sessão de Estudo | Registro de sessão Pomodoro | Por usuário |

### UX
- **Paginação** em todas as listagens (20 itens por página)
- **Busca por texto** com filtro server-side
- **Ordenação** clicando no cabeçalho da coluna (ASC/DESC)
- **Validação de formulários** inline com borda vermelha e mensagem por campo
- **Toast notifications** para feedback de ações (criar, editar, excluir)
- **Error Boundary** com fallback e botão "Tentar novamente"
- **Loading states** com spinners e skeletons
- **Responsivo** — sidebar colapsa em mobile com menu hamburger

### Dashboard
- Cards com contagem de cursos, matérias, avaliações, tópicos e lembretes
- Próximas avaliações (ordenadas por data)
- Tópicos pendentes de estudo
- Próximos lembretes

### Features extras
- **Calculadora de notas** — média ponderada por matéria (coluna "Média" na tabela de matérias)
- **Calendário** — visão mensal com avaliações e lembretes marcados nos dias
- **Gráficos de progresso** — barras de nota por matéria, % de tópicos estudados, faltas acumuladas
- **Timer Pomodoro** — 25 min foco / 5 min pausa, vinculado a tópico pendente, com histórico de sessões

---

## Modelo de Dados

```
User ──┐
       ├── Curso ──── Materia ──┬── Avaliacao ──── Lembrete
       │              │         ├── Falta
       │              │         ├── Topico ──── SessaoEstudo
       │              │         │     │
Docente ──────────────┘         │     └── TecnicaEstudo
                                │
```

---

## Como Rodar

### Pré-requisitos
- Python 3.13+
- Node.js 22+
- (Opcional) Docker + docker-compose

### Desenvolvimento Local

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# API em http://localhost:8000
# Docs em http://localhost:8000/api/docs
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# App em http://localhost:5173
```

### Com Docker
```bash
docker compose up --build
# Frontend: http://localhost
# Backend API: http://localhost:8000/api/docs
```

---

## Variáveis de Ambiente (Backend)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | URL do PostgreSQL (`postgres://...`) | SQLite local |
| `DJANGO_SECRET_KEY` | Chave secreta Django | Valor hardcoded (dev) |
| `DJANGO_DEBUG` | Modo debug (`true`/`false`) | `true` |
| `ALLOWED_HOSTS` | Hosts permitidos (separado por vírgula) | `localhost,127.0.0.1,testserver` |

---

## API

Documentação interativa disponível em `/api/docs` (OpenAPI/Swagger).

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Dados do usuário logado |
| PUT | `/api/auth/profile` | Atualizar email |
| POST | `/api/auth/change-password` | Alterar senha |

### CRUD (todas as entidades seguem o mesmo padrão)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/{entidade}?page=1&search=&ordering=nome` | Listar (paginado) |
| POST | `/api/{entidade}` | Criar |
| PUT | `/api/{entidade}/{id}` | Atualizar |
| DELETE | `/api/{entidade}/{id}` | Excluir |

**Entidades:** `cursos`, `docentes`, `materias`, `avaliacoes`, `topicos`, `lembretes`, `tecnicas-estudo`, `sessoes`

**Faltas** (endpoints especiais aninhados em matérias):
| Método | Rota |
|--------|------|
| GET | `/api/materias/{id}/faltas` |
| POST | `/api/materias/{id}/faltas` |
| PUT | `/api/faltas/{id}` |
| DELETE | `/api/faltas/{id}` |

---

## Testes

### Backend (57 testes — pytest)
```bash
cd backend
pip install pytest pytest-django
python -m pytest estudos/tests/ -v
```

### Frontend (20 testes — vitest)
```bash
cd frontend
npm run test
```

### Qualidade de código
```bash
# Frontend
cd frontend
npm run lint        # ESLint
npm run format      # Prettier
npx tsc --noEmit    # TypeScript

# Backend (implícito via CI)
```

### CI/CD
GitHub Actions executa automaticamente em push/PR na branch `main`:
- **Backend:** pip install → pytest (57 testes)
- **Frontend:** npm ci → lint → tsc → test → build

---

## Scripts (Frontend)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento Vite |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch mode) |

---

## Licença

Projeto acadêmico/pessoal.
