**APROVADO**

# Parecer de Conformidade — Tarefa 1

**Veredito:** APROVADO

## Critérios verificados

| Critério (spec/tarefa) | Situação | Onde |
| --- | --- | --- |
| Model `User` com `id` (cuid), `name`, `email` único, `passwordHash`, `createdAt` | atendido | `apps/api/prisma/schema.prisma:15-21`; `docs/architecture.md:214,234-240` |
| Migration Prisma com tabela `User` e unique em `email` | atendido | `apps/api/prisma/migrations/20261113163451_create_user/migration.sql:2-13` |
| Teste primeiro, em `apps/api/test/` e sufixo `.e2e-spec.ts`, fora da unitária | atendido | `apps/api/test/user-model.e2e-spec.ts:1`; `apps/api/vitest.config.e2e.ts:8`; `npm test` = 1 arquivo/1 teste; `npm run test:e2e` = 2 arquivos/3 testes; mtime do teste 13:33 contra schema/migration 13:34 |
| Conecta ao banco de teste via `TEST_DATABASE_URL` | atendido | `test/user-model.e2e-spec.ts:14,28`; `.env.example:2`; saída do e2e: `database "appdb_test"` |
| Executa `prisma migrate deploy` | atendido | `test/user-model.e2e-spec.ts:22-26`; saída do e2e: `1 migration found` |
| Verifica que a tabela `User` existe | atendido | `test/user-model.e2e-spec.ts:36-44` |
| Verifica unique em `email` | atendido, com ressalva de robustez | `test/user-model.e2e-spec.ts:46-59`; `migration.sql:13` |
| Decisão 4: nenhum service/controller/DTO/`PrismaService`; nenhum outro model | atendido | diff com 6 arquivos, nenhum em `apps/api/src/modules`; `schema.prisma` só tem `User` |
| CA1 — precondição de persistência da senha protegida | atendido como precondição; CA completo fora desta tarefa | `schema.prisma:19`; `migration.sql:6`; hash e fluxo ficam na Tarefa 2 |
| CA4 — precondição de e-mail único | atendido como precondição; erro “em uso” fica na Tarefa 2 | `migration.sql:13`; teste acima |
| Escopo não antecipado | atendido | diff sem service/controller/DTO/`PrismaService`; `scripts/create-test-db.mjs` é infraestrutura de teste, não comportamento de spec |

Sobre a decisão 2: o teste lê `TEST_DATABASE_URL` e conecta com ela (`test/user-model.e2e-spec.ts:14,28`); em `:24` a mesma URL é repassada como `DATABASE_URL` apenas ao processo filho do Prisma CLI, porque `prisma.config.ts:12` exige esse nome. A saída do e2e confirma `appdb_test`, portanto o `DATABASE_URL` do `.env` não foi usado.

## Apontamentos

Nenhum apontamento bloqueante.

## Sugestões

1. **Apertar a asserção do índice único** — `apps/api/test/user-model.e2e-spec.ts:46-59`. A query aceita índice composto que contenha `email`, não restringe ao schema `public` e não verifica `indisvalid`. Para provar “e-mail único sozinho”, exigir `ix.indnatts = 1`, `ix.indisvalid = true` e `n.nspname = 'public'`. Hoje a migration está correta (`migration.sql:13`), então não bloqueia.
2. **Script órfão** — `apps/api/scripts/create-test-db.mjs:1-2`. Não há referência a ele em `package.json`, README ou CI. Ligar a um script npm (ex.: `db:test:create`) e documentar, ou mover para tarefa de manutenção; caso contrário, o pré-requisito “banco `appdb_test` existente” fica como passo manual não registrado.
3. **Documentação do banco de teste** — `docs/architecture.md:300-309` só descreve `DATABASE_URL` local/CI/produção. Registrar `TEST_DATABASE_URL`/`appdb_test` no README ou no §6.3 evita e2e não reproduzível em checkout limpo. Não é exigência da Tarefa 1.
4. **Lint não executado** — `npm run lint` foi bloqueado pela política de permissões desta sessão. `npm test` (1/1) e `npm run test:e2e` (3/3) passaram; se o lint for critério do fluxo, deve ser rodado fora do sandbox.
