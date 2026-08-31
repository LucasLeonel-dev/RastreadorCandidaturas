# Rastreador de Candidaturas — Contexto do Projeto

Aplicação para controlar candidaturas a estágios/vagas: cadastro de empresas e
vagas, status (aplicado, entrevista, oferta, rejeitado), datas e anotações.
Cada usuário só enxerga suas próprias candidaturas.

## Quem está desenvolvendo

Estudante de Engenharia de Software (4º período). Conhecimentos sólidos em JS,
HTML, CSS, Dart; noções de C (vetores, algoritmos) e passagem breve por Python
e SQL. Fastify, Prisma, PostgreSQL e JWT são tecnologias novas, aprendidas
durante este projeto — não assumir familiaridade prévia com elas.

**Modo de trabalho preferido: planejamento primeiro.** Priorize explicações,
direcionamento e esclarecimento de conceitos em vez de escrever código
diretamente. Só escreva ou edite código quando for explicitamente pedido.
Respostas devem ser concisas e práticas, sem explicações longas desnecessárias.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Fastify (TypeScript, `tsx`, target CommonJS) |
| Banco de dados | PostgreSQL |
| ORM | Prisma |
| Autenticação | JWT (`@fastify/jwt`) |
| Hash de senha | bcrypt ou argon2 |
| Docs da API | `@fastify/swagger` + `@fastify/swagger-ui` |
| Validação | Zod ou JSON Schema nativo do Fastify |

## Estrutura de pastas

```
rastreador-candidaturas/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── plugins/          # jwt, swagger, cors, prisma-client
│   │   ├── modules/
│   │   │   ├── auth/         # registro/login
│   │   │   ├── companies/    # CRUD de empresas
│   │   │   └── applications/ # CRUD de candidaturas
│   │   ├── middlewares/      # verificação de JWT
│   │   └── server.ts
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   └── App.jsx
    ├── .env
    └── package.json
```

## Modelo de dados (MVP)

- **users**: id, name, email (único), password_hash, created_at
- **companies**: id, user_id (FK), name, website?, created_at
- **applications**: id, user_id (FK), company_id (FK), role_title, status
  (`applied` | `interview` | `offer` | `rejected` | `withdrawn`), applied_at,
  notes?, created_at, updated_at

## Convenções

- Nomear rotas e tabelas em inglês (`applications`, não `candidaturas`).
- Toda rota autenticada filtra por `user_id` do token — nunca confiar em `id`
  vindo do frontend sem checar o dono.
- Segredos (string de conexão, JWT secret) só em `.env`, nunca commitados.
- Commits pequenos e descritivos (ex.: `feat: add applications CRUD routes`).
- Validar todo input no backend, mesmo com validação no frontend.

## Status atual

Fase 0/1 em andamento: tsconfig.json, `tsx`, Swagger/Swagger-UI, variáveis de
ambiente e geração do JWT secret já configurados. Próximo: `schema.prisma`
com as três tabelas e primeira migration.

Roadmap completo (fases 0–9) em `planejamento-projeto.md`, na raiz do projeto
— consultar sempre que uma fase for concluída ou surgir dúvida sobre o próximo
passo.
