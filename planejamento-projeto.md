# Planejamento — Rastreador de Candidaturas de Estágio/Emprego

Documento vivo de planejamento técnico do projeto. A ideia é usar este arquivo como
bússola durante o desenvolvimento: volte aqui sempre que terminar uma fase ou tiver
dúvida sobre o que vem a seguir, e atualize-o conforme o projeto evoluir.

## 1. Visão geral

Uma aplicação web para controlar candidaturas a estágios/vagas: cadastro de empresas
e vagas, acompanhamento de status (aplicado, entrevista, rejeitado, oferta, etc.),
datas relevantes e anotações pessoais. Cada usuário autenticado só enxerga suas
próprias candidaturas.

**Funcionalidades núcleo (MVP):**

- Cadastro/login de usuário com autenticação JWT.
- CRUD de candidaturas (empresa, cargo/vaga, status, data da candidatura, notas).
- Listagem com filtro por status.
- Documentação da API via Swagger.

**Ideias para depois do MVP** (registre aqui outras que forem surgindo):

- Dashboard com métricas (quantas candidaturas por status, taxa de resposta).
- Lembretes/notificações de follow-up.
- Anexar link da vaga ou currículo enviado.
- Histórico de mudanças de status (timeline).
- Tags/categorias (remoto, híbrido, presencial).
- Análise Currículo, para saber se a pessoa possui chances para a vaga 

## 2. Stack tecnológica

| Camada | Escolha | Observação |
|--------|---------|------------|
| Frontend | React + Vite + Tailwind CSS | Já definido no escopo do projeto |
| Backend | Node.js + **Fastify** com TS| Framework leve e rápido, aproveita para trabalhar TS |
| Banco de dados | **PostgreSQL** | Robusto, gratuito, muito usado no mercado |
| ORM | **Prisma** (sugestão) | Facilita muito trabalhar com PostgreSQL vindo de pouca experiência em SQL; gera migrations e tipagem automaticamente |
| Autenticação | JWT (`@fastify/jwt`) | Tokens assinados, sem sessão no servidor |
| Hash de senha | `bcrypt` ou `argon2` | Nunca salvar senha em texto puro |
| Documentação da API | Swagger/OpenAPI (`@fastify/swagger` + `@fastify/swagger-ui`) | Fastify tem integração nativa muito boa com isso |
| Validação de dados | Zod ou os schemas nativos do Fastify (JSON Schema) | Fastify já valida requests via JSON Schema, o que também alimenta o Swagger automaticamente |
| Ambiente | Local, por enquanto (deploy fica para uma fase futura) | — |

Por que Prisma: ele te dá uma "ponte" amigável para o SQL — você escreve consultas
em JS/TS e ele traduz para PostgreSQL, além de gerenciar as migrations do banco.
Como sua vivência em SQL ainda é breve, isso reduz bastante o atrito inicial sem te
afastar do SQL puro (dá pra ver o SQL gerado quando quiser aprender mais).

## 3. Arquitetura geral

Dois projetos separados (repositórios ou pastas na mesma raiz), comunicando-se via
API REST:

```
rastreador-candidaturas/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── plugins/        # jwt, swagger, cors, prisma-client
│   │   ├── modules/
│   │   │   ├── auth/       # rotas de registro/login
│   │   │   ├── companies/  # CRUD de empresas
│   │   │   └── applications/ # CRUD de candidaturas/vagas
│   │   ├── middlewares/    # verificação de JWT
│   │   └── server.js       # bootstrap do Fastify
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/             # funções que chamam a API (fetch/axios)
    │   ├── components/
    │   ├── pages/            # Login, Dashboard, Candidaturas
    │   ├── context/          # contexto de autenticação
    │   └── App.jsx
    ├── .env
    └── package.json
```

Fluxo básico: o frontend guarda o JWT (em memória ou `localStorage`) após o
login, e o envia no header `Authorization: Bearer <token>` em toda requisição
autenticada. O backend valida esse token em um hook/middleware antes de liberar
acesso às rotas de empresas e candidaturas.

## 4. Modelagem do banco de dados

Três tabelas principais para o MVP:

**users**

| Campo | Tipo | Observação |
|---|---|---|
| id | UUID / serial | chave primária |
| name | string | |
| email | string | único |
| password_hash | string | nunca a senha em texto puro |
| created_at | timestamp | |

**companies** (empresas)

| Campo | Tipo | Observação |
|---|---|---|
| id | UUID / serial | chave primária |
| user_id | FK → users.id | cada empresa pertence a um usuário |
| name | string | |
| website | string | opcional |
| created_at | timestamp | |

**applications** (candidaturas/vagas)

| Campo | Tipo | Observação |
|---|---|---|
| id | UUID / serial | chave primária |
| user_id | FK → users.id | |
| company_id | FK → companies.id | |
| role_title | string | nome da vaga/cargo |
| status | enum | `applied`, `interview`, `offer`, `rejected`, `withdrawn` |
| applied_at | date | data da candidatura |
| notes | text | opcional |
| created_at / updated_at | timestamp | |

Essa modelagem já cobre o essencial. Se quiser simplificar ainda mais no início,
dá para começar sem a tabela `companies` separada (nome da empresa como campo de
texto dentro de `applications`) e só "quebrar" em tabela própria depois — mas
como o projeto já prevê CRUD de empresas, vale montar as duas tabelas desde já.

## 5. Endpoints da API (MVP)

| Método | Rota | Descrição | Autenticado? |
|---|---|---|---|
| POST | `/auth/register` | Cria usuário | Não |
| POST | `/auth/login` | Retorna JWT | Não |
| GET | `/companies` | Lista empresas do usuário | Sim |
| POST | `/companies` | Cria empresa | Sim |
| PUT | `/companies/:id` | Edita empresa | Sim |
| DELETE | `/companies/:id` | Remove empresa | Sim |
| GET | `/applications` | Lista candidaturas (com filtro por status via query param) | Sim |
| POST | `/applications` | Cria candidatura | Sim |
| GET | `/applications/:id` | Detalha uma candidatura | Sim |
| PUT | `/applications/:id` | Edita candidatura (inclui mudar status) | Sim |
| DELETE | `/applications/:id` | Remove candidatura | Sim |

Todas as rotas autenticadas devem filtrar sempre por `user_id` do token — nunca
confiar em um `id` vindo do frontend sem checar se pertence ao usuário logado.

## 6. Roadmap de desenvolvimento por fases

Pensado para ir do zero até um MVP funcional, com marcos pequenos e testáveis.
Marque cada item conforme for concluindo.

**Fase 0 — Setup do ambiente**
- Instalar PostgreSQL localmente (ou via Docker).
- Criar repositório(s), estrutura de pastas `backend/` e `frontend/`.
- Inicializar projeto Fastify (`npm init` + `fastify`, `@fastify/jwt`, `@fastify/swagger`, `@fastify/swagger-ui`, `prisma`, `@prisma/client`).
- Inicializar projeto React com Vite + Tailwind.

**Fase 1 — Backend: fundação**
- Configurar Prisma (`schema.prisma`) com as três tabelas.
- Rodar a primeira migration e validar conexão com o banco.
- Subir um servidor Fastify básico com uma rota de "health check" (`GET /health`).

**Fase 2 — Autenticação**
- Implementar `POST /auth/register` (com hash de senha).
- Implementar `POST /auth/login` (gera e retorna JWT).
- Criar middleware/hook que valida o JWT nas rotas protegidas.

**Fase 3 — CRUD de empresas**
- Implementar as 4 rotas de `companies`.
- Testar tudo via Swagger UI ou Insomnia/Postman antes de partir pro frontend.

**Fase 4 — CRUD de candidaturas**
- Implementar as rotas de `applications`, incluindo filtro por status.
- Garantir que toda consulta/edição respeita o dono (`user_id`).

**Fase 5 — Documentação Swagger**
- Configurar `@fastify/swagger` + `@fastify/swagger-ui` (se for feito desde a Fase 0, os schemas de validação do Fastify já alimentam a doc automaticamente — vale configurar cedo e ir documentando rota por rota).
- Revisar se todas as rotas estão documentadas com exemplos de request/response.

**Fase 6 — Frontend: base**
- Estruturar rotas (React Router): Login, Registro, Dashboard/Lista de candidaturas.
- Criar contexto de autenticação (guardar token, usuário logado, logout).
- Estilizar com Tailwind (layout base, componentes reutilizáveis).

**Fase 7 — Frontend: integração com a API**
- Tela de login/registro consumindo `/auth`.
- Listagem de candidaturas com filtro por status.
- Formulário de criação/edição de candidatura e de empresa.
- Tratamento de erros (token expirado, campos inválidos, etc.).

**Fase 8 — Polimento e extras**
- Revisar UX (loading states, mensagens de erro amigáveis, confirmação antes de deletar).
- Escolher e implementar 1-2 itens da lista de "ideias para depois do MVP" (seção 1).
- (Opcional) Testes automatizados básicos no backend.

**Fase 9 — Deploy** *(fora do escopo imediato, mas deixado registrado para quando decidir avançar)*
- Backend: Render, Railway ou Fly.io.
- Frontend: Vercel ou Netlify.
- Banco: Supabase, Neon ou Railway Postgres.

## 7. Convenções e boas práticas sugeridas

- Nomear rotas e tabelas em inglês (`applications`, não `candidaturas`) para manter
  consistência com bibliotecas e exemplos que você for consultar.
- Variáveis sensíveis (string de conexão do banco, segredo do JWT) sempre em `.env`,
  nunca commitadas — adicionar `.env` ao `.gitignore` desde o commit inicial.
- Commits pequenos e descritivos, um por funcionalidade (ex.: `feat: add applications CRUD routes`).
- Validar todo input do usuário no backend (não confiar apenas na validação do frontend).

## 8. Recursos de estudo por tecnologia nova

Como Fastify, JWT, Swagger, Prisma e PostgreSQL são relativamente novos pra você,
vale reservar um tempo curto de estudo dirigido antes de cada fase que os introduz:

- **Fastify**: documentação oficial (fastify.dev) tem um "Getting Started" enxuto — dá pra seguir em 1-2 horas.
- **Prisma**: o tutorial oficial ("Prisma + PostgreSQL") guia da instalação até o primeiro CRUD.
- **JWT**: entender o conceito (token assinado, payload, expiração) é mais importante do que decorar a biblioteca — o pacote `@fastify/jwt` abstrai boa parte da mecânica.
- **Swagger/OpenAPI**: não precisa aprender a especificação inteira; o plugin do Fastify gera a doc a partir dos schemas de validação que você já vai escrever para as rotas.
- **PostgreSQL/SQL**: com o Prisma cuidando das queries, o SQL essencial que vale entender é: `SELECT`, `WHERE`, `JOIN` simples e o conceito de chave estrangeira — o suficiente para debugar quando algo não bater.

## 9. Próximos passos imediatos

1. Instalar PostgreSQL localmente e confirmar que consegue conectar (via `psql` ou uma ferramenta como TablePlus/DBeaver).
2. Criar a pasta `backend/` e rodar o setup inicial do Fastify + Prisma (Fase 0/1).
3. Voltar aqui e marcar a Fase 0 como concluída antes de seguir para autenticação.

---
*Última atualização: 27/08/2026. Atualize esta seção sempre que revisar o documento.*
