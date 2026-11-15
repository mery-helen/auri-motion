# Parecer de Código — Tarefa 2 (rodada 2)

**Veredito:** APROVADO

Escopo: `git diff 1b3f08ebc1e3e7d1d94cf6597a8df5d3ec13c9da` (15 arquivos). Execução em `apps/api`: `npm test` → 3 arquivos / **13 testes passando** (o `pretest` gerou o Prisma Client antes); `npm run test:e2e` → 2 arquivos / 3 testes passando. **`npm run lint` não rodou**: a allowlist desta sessão libera `git *`, `ls`, `cat`, `npm test*`, `npm run test*`, `npx vitest|jest`; `npm run lint` foi negado pela regra de permissão antes de executar. Eixo de lint fica sem prova de execução — não é omissão do implementador. Inspecionei manualmente o `.oxlintrc.json` (só `no-floating-promises: error`, type-aware): nenhuma promise solta nos arquivos do diff (`await bootstrap()` no topo, awaits nos specs), mas isso não substitui a execução.

## Apontamentos aceitos na rodada 1 — situação

1. **Passo reprodutível de geração do Prisma Client — FECHADO.** `apps/api/package.json:18-20` adiciona `postinstall`, `prisma:generate` e `pretest` com `prisma generate`; o `output` do schema não mudou (`prisma/schema.prisma:8`). Comprovação empírica: a saída de `npm test` mostra `pretest → prisma generate → Generated Prisma Client (7.10.1)` antes da suíte, sem geração manual.
2. **`P2002` → `ConflictException` com teste — FECHADO.** `auth.service.ts:46-55` captura `Prisma.PrismaClientKnownRequestError` com `code === 'P2002'` e relança `ConflictException`, preservando o rethrow dos demais erros (`:54`, não engole falha). Teste dedicado em `auth.service.spec.ts:87-103` exercita exatamente o caminho pós-`findUnique` (asserta 1 chamada de `findUnique` e 1 de `create`). É o 13º teste da suíte.

## Apontamentos (bloqueiam)

_(Nenhum.)_

Não encontrei violação de camada, segredo em código, erro engolido, duplicação de regra existente nem teste que quebre por refatoração sem mudança de comportamento. `auth.controller.ts:9-12` só delega; a regra permanece em `auth.service.ts`. `RegisterDto` segue validado pelo `ValidationPipe` global com `whitelist`/`forbidNonWhitelisted` (`main.ts:7-13`), conforme ID7.

## Sugestões (não bloqueiam)

- **`test:e2e` não tem `pretest:e2e`** — `apps/api/package.json:20`. Em clone limpo o `postinstall` cobre, mas num checkout já instalado, com `generated/` apagado ou defasado, `npm run test:e2e` falha no import antes de qualquer teste; não há `pretest:e2e teste2e`. Um `pretest:e2e` (ou um script comum) fecha a mesma lacuna que o `pretest` fechou para `npm test`.
- **`P2002` tratado de forma genérica** — `auth.service.ts:47-52`. Hoje `User` só tem `email` único, então não há bug; quando surgir outra constraint única (ou índice case-insensitive), qualquer `P2002` será reportado como “E-mail já está em uso.” Checar `error.meta?.target` contendo `email` mantém a mensagem honesta no futuro.
- **`postinstall` é incondicional** — `apps/api/package.json:18`. `prisma` é devDependency (`:55`); um install de produção sem devDependencies (`npm ci --omit=dev`, cenário plausível para o container do ID19) falha no `postinstall`. Quando o Dockerfile/CI for materializado, vale rodar o `generate` numa etapa que tenha as devDependencies.

## Observações fora do escopo deste diff

- **ID10 adiado por decisão do despacho**: resposta de sucesso continua objeto cru e erro no formato padrão do Nest. Candidato a Issue de manutenção.
- **Sugestões 2 a 8 da rodada 1 permanecem**, por decisão registrada: normalização de e-mail, regex de senha aceitando espaço, `ConfigService` no `PrismaService`, `RegisteredUser` como DTO de resposta dedicado, `createValidationPipe()` compartilhado, mensagens duplicadas por `@IsString` + `@IsNotEmpty`, override de `PrismaService` no `test/app.e2e-spec.ts` (que hoje sobe conexão real; o e2e passou porque há Postgres local).
- **`TS6059` do build** (`generated/` fora do `rootDir`) — fora desta tarefa, conforme despacho.
- **`.github/workflows/` ainda não existe**: quando o ID18 for materializado, o `npm ci` precisa rodar o `postinstall` (ou um passo explícito de `prisma generate`) antes do Vitest — o mecanismo agora existe, a ordem no pipeline é que precisa ser garantida.
- **`class-validator`/`class-transformer` marcados `peer: true` no lock** (`package-lock.json`): são dependências diretas de `apps/api` e o npm resolveu; não há falha observável, mas se `npm ci` reclamar de lock fora de sincronia no CI, é o primeiro lugar a olhar.

Nada foi editado.
