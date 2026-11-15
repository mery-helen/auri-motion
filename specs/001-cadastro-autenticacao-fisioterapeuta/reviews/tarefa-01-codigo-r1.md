# Parecer de Código — Tarefa 1

**Veredito: APROVADO**

Escopo revisado: `git diff a2e8d422a559c4997d83341870bcebd75339a973` (6 arquivos). Rodei as suítes: `npm run test:e2e` em `apps/api` → 2 arquivos / 3 testes passando (migration já aplicada em `appdb_test`); `npm test` → 1 arquivo / 1 teste passando. **Não rodei `npm run lint`**: a lista de comandos liberada nesta sessão não inclui `npm run lint` (só `git diff/log/status`, `ls`, `cat`, `npm test*`, `npx vitest/jest`), então esse eixo do parecer sai incompleto por limitação de permissão, não por omissão.

## Conformidade com os padrões

- **Model `User` — OK.** `apps/api/prisma/schema.prisma:15-21` tem exatamente `id` (cuid), `name`, `email @unique`, `passwordHash`, `createdAt`, batendo com `docs/architecture.md:214` (§6.1) e `:234-240` (§6.2). Nada a mais, nada a menos.
- **Migration — OK.** `apps/api/prisma/migrations/20261113163451_create_user/migration.sql:2-13`: tabela `"User"` aspeada (evita colisão com a palavra reservada), `User_pkey` em `id`, `User_email_key` como `CREATE UNIQUE INDEX`, `createdAt TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP`. Nenhum `DROP`/`ALTER`/`TRUNCATE`. `migration_lock.toml` com `provider = "postgresql"` correto.
- **Prisma 7 — OK.** `datasource db` sem `url` (`schema.prisma:11-13`), URL só em `prisma.config.ts:11-13`.
- **ESM — OK.** Não há imports relativos no diff; `node:path`, `node:url`, `dotenv` e `pg` são bare imports. `fileURLToPath(new URL('..', import.meta.url))` em `user-model.e2e-spec.ts:7` e `create-test-db.mjs:8` resolve corretamente para `apps/api/`.
- **ID8 — OK.** Nenhum código de produção; o `pg` aparece só no teste e no script de apoio ao banco de teste, conforme a pré-autorização do despacho.
- **ID17 — OK.** `.env.example:1-2` só tem placeholders (`usuario:senha`, `nomedobanco*`); o teste lê `TEST_DATABASE_URL` do ambiente (`user-model.e2e-spec.ts:14`) sem valor hardcoded.
- **Convenção de teste — OK.** `apps/api/test/user-model.e2e-spec.ts` casa com `include: ['**/*.e2e-spec.ts']` de `vitest.config.e2e.ts:8` e não é capturado pelo `include: ['**/*.spec.ts']` unitário de `vitest.config.ts:10`. `globals: true` dispensa import de `describe/it/expect`; não há mock a substituir por `vi.fn`.
- **Decisões fixadas — OK.** Banco de teste próprio, `prisma migrate deploy` dentro do `beforeAll` (`user-model.e2e-spec.ts:22-26`), `DATABASE_URL` sobrescrita só no processo filho (não vaza para o banco de dev, já que `dotenv` não sobrescreve env existente), e nenhum service/controller/DTO/`PrismaService` criado.

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

1. **O teste valida o estado do banco, não a migration do repositório.** `test/user-model.e2e-spec.ts:22-26` faz `migrate deploy` sobre um banco persistente; se a migration for apagada no futuro e `appdb_test` ainda tiver a tabela, `:36-44` continua verde — o teste não protege a regressão que o plano diz proteger. Barato de fechar: checar `_prisma_migrations` por `20261113163451_create_user` ou recriar o schema antes do deploy.
2. **A constraint é verificada por catálogo, não por comportamento.** `test/user-model.e2e-spec.ts:47-58` depende de `pg_index`/`indkey`; um `INSERT` duplicado esperando `23505` provaria o mesmo com menos acoplamento a internals do Postgres. Além disso, `:52-55` não filtra `t.relnamespace`, então um `User` em outro schema/índice composto com `email` também passaria.
3. **`scripts/create-test-db.mjs` está órfão e fora do plano.** O plano (`plan.md:21-23`) prevê só schema + migration; o script não é citado em lugar algum, não está em nenhum script de `apps/api/package.json:10-22`, não é alcançável pelo `lint` (`package.json:17` cobre só `src/ test/`) e a pasta `scripts/` não existe na árvore de `architecture.md:124-138`. Ou vira `pretest:e2e` (que resolveria o erro P1003 de quem clona o repo sem `appdb_test`), ou sai do diff.
4. **`TEST_DATABASE_URL` não está documentada na arquitetura.** `architecture.md:300-310` (§6.3) só descreve `DATABASE_URL` por ambiente; a decisão 2 do usuário cria uma variável nova que a régua não conhece. Como o revisor não altera doc, fica como candidata a Issue de manutenção. No mesmo tema, `.env.example:2` exemplifica `nomedobanco_test` enquanto a decisão fixou `appdb_test` — placeholder, mas convém alinhar para o próximo desenvolvedor.
5. **`execSync` com `stdio: 'inherit'`** (`test/user-model.e2e-spec.ts:22-26`) despeja a saída do Prisma no relatório do Vitest e trava a thread por até 16s. `execFileSync` com captura de saída (só imprimindo em falha) deixa o e2e mais legível — e evita o prompt do `npx` caso `prisma` não esteja instalado no ambiente.

## Observações fora do escopo deste diff

- O pipeline de CI do ID18 (`architecture.md:89`) ainda não existe em `.github/workflows/` — quando existir, o `test:e2e` vai exigir o service container do Postgres **e** `TEST_DATABASE_URL` apontando para ele, senão o merge bloqueia por timeout de conexão. Candidata a Issue de manutenção.
- `.env.example` sem newline final (`:2`) é estilo pré-existente no arquivo, não foi introduzido por este diff.

Nada foi editado.
