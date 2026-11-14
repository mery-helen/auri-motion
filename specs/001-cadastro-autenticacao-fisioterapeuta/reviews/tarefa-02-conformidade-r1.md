# Parecer de Conformidade — Tarefa 2

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — cadastro válido cria a conta e a senha nunca é armazenada em texto puro | atendido | `apps/api/src/modules/auth/auth.service.ts:19-43` (bcrypt antes do `create`); `auth.service.spec.ts:37-60` (asserta `passwordHash != senha` e `bcrypt.compare`); `auth.controller.spec.ts:58-79` (201 e corpo sem `passwordHash`) — passou em `npm test` |
| CA1 — redirecionamento para a tela de login após o cadastro | fora desta tarefa | Frontend, previsto na Tarefa 4 do `plan.md` |
| CA4 — e-mail já existente impede a duplicação e informa que está em uso | atendido | `auth.service.ts:20-26` (`ConflictException`); `auth.service.spec.ts:62-74` (conflito + `create` não chamado); `auth.controller.spec.ts:81-100` (409 e mensagem) — passou em `npm test` |
| CA5 — campos obrigatórios em branco são rejeitados apontando os campos faltantes | atendido | `dto/register.dto.ts:6-20`; `auth.service.spec.ts:78-96` (DTO real via `plainToInstance`/`validate`); `auth.controller.spec.ts:102-116` (400 com as três mensagens) — passou em `npm test` |
| CA6 — e-mail em formato inválido rejeitado com mensagem específica | atendido | `dto/register.dto.ts:10-12`; `auth.service.spec.ts:112-121`; `auth.controller.spec.ts:118-126` — passou em `npm test` |
| CA6 — senha fora dos critérios de força rejeitada com mensagem específica | atendido | `dto/register.dto.ts:14-20` (`@Matches` com mínimo 8, maiúscula, número e especial); `auth.service.spec.ts:98-110` (4 senhas fracas); `auth.controller.spec.ts:128-133` — passou em `npm test` |
| Teste primeiro — DTO exercitado de verdade (não mockado) | atendido | `auth.service.spec.ts` usa `plainToInstance` + `validate`; o spec de controller exercita o `ValidationPipe` global real |
| E2E antigo preservado | atendido | `apps/api/test/app.e2e-spec.ts` inalterado e passando |
| Fiação mínima autorizada (PrismaService/PrismaModule `@Global`, deps, ValidationPipe global, AuthModule no app.module) | atendido | `prisma/prisma.module.ts`, `prisma/prisma.service.ts`, `main.ts:5-12`, `app.module.ts:5-9`, `package.json` — todos dentro do autorizado |

Execução: `npm test` → 3 arquivos, 12 testes passando. `npm run test:e2e` → 2 arquivos, 3 testes passando.

## Apontamentos
_(Nenhum.)_
