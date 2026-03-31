# G-Force Frontend

Frontend web da plataforma G-Force (React + TypeScript + Vite).

## Funcionalidades

- Landing page publica
- Login e registro
- Dashboards por papel (`ADMIN`, `PROFESSOR`, `ALUNO`)
- Gestao de alunos e professores
- Editor de treino
- Editor de dieta
- Evolucao fisica e historico
- Upload de fotos e arquivos
- Links de lead e analytics no dashboard admin

## Requisitos

- Linux ou macOS com shell `bash`
- Node.js `20.19.4` recomendado
- `corepack` habilitado com `pnpm@10.13.1`

## Setup local

Na raiz do workspace, o caminho mais rapido e:

```bash
pnpm run setup:frontend
```

Dentro de `api-gym-frontend`, o fluxo equivalente e:

```bash
pnpm install
cp .env.example .env
pnpm run dev
```

App local: `http://localhost:5173`

Dependencia obrigatoria: o backend precisa estar rodando e acessivel na URL configurada em `VITE_API_URL`. No setup padrao do workspace, a API sobe em `http://localhost:3333`.

## Variaveis de ambiente

Crie `.env` a partir de `.env.example`:

```env
VITE_API_URL=http://localhost:3333
```

Para producao (Vercel), configure `VITE_API_URL` para a URL publica do backend.
Se voce mudar host ou porta do backend no local, ajuste este valor antes de subir o frontend.

## Build

```bash
pnpm run build
pnpm run preview
```

## Rotas principais

Publicas:

- `/landing`
- `/login`
- `/register`

Admin:

- `/admin/dashboard`
- `/admin/alunos`
- `/admin/professores`
- `/admin/invite-codes`
- `/admin/lead-links`

Professor:

- `/professor/dashboard`
- `/professor/alunos/:id/treino`
- `/professor/alunos/:id/dieta`

Aluno:

- `/aluno/dashboard`
- `/aluno/treino`
- `/aluno/dieta`
- `/aluno/evolucao`
- `/aluno/fotos-arquivos`

## Lead tracking no frontend

- A landing detecta `?lead=<slug>`
- Dispara `POST /lead-links/click`
- Salva `leadSlug` localmente (TTL de 30 dias)
- No registro, envia `leadSlug` automaticamente

Arquivos principais:

- `src/pages/LandingPage.tsx`
- `src/utils/leadTracking.ts`
- `src/pages/auth/RegisterPage.tsx`
- `src/pages/admin/LeadLinksPage.tsx`
- `src/pages/auth/AdminDashboard.tsx`

## Deploy

- Projeto preparado para Vercel (`vercel.json`)
- Garanta `VITE_API_URL` configurada no ambiente do deploy

## Troubleshooting

- `VITE_API_URL nao definido`: recrie `.env` a partir de `.env.example` ou ajuste o valor manualmente.
- `Servidor nao respondeu`: confirme que `pnpm run dev:backend` esta ativo em `http://localhost:3333`.
- Erro de Node ao instalar ou rodar Vite: use Node `20.19.4` e `pnpm@10.13.1`.
- Se precisar expor o frontend em rede local ou tunel, rode `pnpm run dev -- --host`.
