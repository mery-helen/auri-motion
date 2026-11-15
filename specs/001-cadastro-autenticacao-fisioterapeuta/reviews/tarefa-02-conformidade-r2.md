# Parecer de Conformidade — Tarefa 2 (rodada 2)

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — cadastro válido cria a conta e a senha nunca é armazenada em texto puro | atendido | `apps/api/src/modules/auth/auth.service.ts:29-45` (bcrypt antes do `create`, resposta sem `passwordHash`); `auth.service.spec.ts:47-72` (asserta `passwordHash != senha` e `bcrypt.compare` = true); `auth.controller.spec.ts:58-80` (201 e corpo sem `passwordHash`) |
| CA1 — redirecionamento para a tela de login após o cadastro | fora desta tarefa | Frontend, previsto na Tarefa 4 do `plan.md` |
| CA4 — e-mail já existente impede a duplicação e informa que está em uso | atendido | `auth.service.ts:21-27` (`ConflictException`); `auth.service.spec.ts:74-85` (conflito + `create` não chamado); `auth.controller.spec.ts:82-98` (409 + mensagem) |
| CA5 — campos obrigatórios em branco são rejeitados apontando os campos faltantes | atendido | `dto/register.dto.ts:5-20`; `auth.service.spec.ts:107-116` (DTO real via `plainToInstance`/`validate`); `auth.controller.spec.ts:100-113` (400 com as três mensagens) |
| CA6 — e-mail em formato inválido rejeitado com mensagem específica | atendido | `dto/register.dto.ts:10-12`; `auth.service.spec.ts:128-136`; `auth.controller.spec.ts:115-122` |
| CA6 — senha fora dos critérios de força rejeitada com mensagem específica | atendido | `dto/register.dto.ts:14-20` (mínimo 8, maiúscula, número e especial); `auth.service.spec.ts:118-126` (4 senhas fracas); `auth.controller.spec.ts:124-133` |
| Teste primeiro — DTO exercitado de verdade, não mockado | atendido | `auth.service.spec.ts:26-29,106-143`; `auth.controller.spec.ts:43-51` exercita o `ValidationPipe` global real |

## Apontamentos aceitos na triagem da rodada 1

| # | Apontamento | Situação | Onde |
| --- | --- | --- | --- |
| 1 | Ligar `prisma generate` a script do `apps/api/package.json` (postinstall e/ou pretest) | atendido | `apps/api/package.json:18-20` (`postinstall`, `prisma:generate` e `pretest`). Confirmado em execução: `npm test` disparou `pretest > prisma generate` e gerou o client antes de rodar a suíte |
| 2 | Capturar `P2002` no `create` e relançar `ConflictException`, com teste | atendido | `auth.service.ts:46-55` (captura `PrismaClientKnownRequestError` código `P2002` → `ConflictException`); teste em `auth.service.spec.ts:87-103` (mock lança `P2002`, espera `ConflictException`, `create` chamado 1×) |

Execução: `npm test` → 3 arquivos, 13 testes passando (12 da rodada 1 + 1 novo do `P2002`). `npm run test:e2e` → 2 arquivos, 3 testes passando (incluindo o e2e legado). Nenhum critério da tarefa ficou sem cobertura.

## Apontamentos
_(Nenhum.)_

Nenhum arquivo foi alterado.
