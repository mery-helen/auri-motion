# Parecer de Conformidade — Tarefa 8

**Veredito:** APROVADO

## Critérios verificados

Não há critério de aceite da spec ligado a esta tarefa (plan.md declara que cobre a pendência 2 da auditoria final, não um CA). Julguei o diff contra as decisões de triagem transcritas no despacho. Nenhuma afirmação do documento contradiz a `spec.md` (que não trata de documentação).

| Afirmação da tarefa (decisões de triagem) | Situação | Onde |
| --- | --- | --- |
| Alinhar §3 com o model `User` no `prisma/` | atendido | `docs/architecture.md:137`; `apps/api/prisma/schema.prisma:15-21` |
| §4 sem `AuthService` no `core/`; listar guards, `JwtInterceptor` e `TokenStore` | atendido | `docs/architecture.md:157,160`; `core/guards/`, `core/interceptors/jwt.interceptor.ts`, `core/session/token.store.ts:8`; `AuthService` em `features/auth/auth.service.ts:32` |
| ID10 (Exception Filter global e ResponseInterceptor) rotulado não implementado | atendido | `docs/architecture.md:88`; `apps/api/src/common/` contém só `decorators/` e `guards/`; `main.ts:1-16` registra só `ValidationPipe` |
| ID14 e §2.3 (Swagger) rotulados não implementados | atendido | `docs/architecture.md:89,96-100`; `@nestjs/swagger` ausente de `apps/api/package.json`; `main.ts` sem setup; `/docs` inexistente |
| ID17 (Joi / `validationSchema`) rotulado não implementado; ConfigModule como parcial | atendido | `docs/architecture.md:57,90`; `app.module.ts:8` (`ConfigModule.forRoot({ isGlobal: true })`, sem `validationSchema`); `joi` ausente do `package.json`; `.env` no `.gitignore` (linhas 17-19) — exceção declarada confere |
| ID18 e §6.3 (CI) rotulados não implementados | atendido | `docs/architecture.md:91,311,120`; `.github/workflows/` só tem `portao-de-entendimento.yml` (checa corpo do PR) e `site.yml` (com guarda `if: github.repository == 'utfpr-gp/utf-sdd-template'`, não roda neste repo) — nenhum workflow roda testes/lint |
| §5 (`config/`, `common/filters`, `common/interceptors`, `common/pipes`, Swagger no `main.ts`) marcado como inexistente | atendido | `docs/architecture.md:187-207`; verificado no disco: sem `config/`, sem `filters/`/`interceptors/`/`pipes/` em `common/`, `modules/` só tem `auth/` |
| Dependências não instaladas rotuladas no §2 (`mercadopago`, `@nestjs/schedule`, `@nestjs/swagger`, `joi`); nenhum ID removido | atendido | `docs/architecture.md:54-58,66`; IDs 10, 14, 17, 18, 19, 20, 21 todos presentes (linhas 88-94); nenhum import dessas libs em `apps/api` fora de `AGENTS.md` |
| ID19 rotulado não verificável (sem Dockerfile, `render.yaml`, `vercel.json`) | atendido | `docs/architecture.md:92`; glob por `Dockerfile*`, `render.yaml`, `vercel.json` no repo: nenhum resultado |
| ID20/ID21 rotulados não implementados (`mercadopago` ausente, `billing/`/`payments/` inexistentes) | atendido | `docs/architecture.md:93-94`; `apps/api/src/modules/` só tem `auth/` |
| §2.3 e §2.4 rotulados não implementados | atendido | `docs/architecture.md:96-106`; `@nestjs/schedule` ausente; sem módulo de agendamento; schema só tem `User` |
| `shared/`, features `patients` (stub, `// TODO #2`), `appointments`, `billing` rotuladas não implementadas; §4.1 sem afirmar feature existente | atendido | `docs/architecture.md:158,161-163,174`; sem diretório `shared/`; `features/` só tem `auth/` e `patients/patients-stub`; `// TODO #2` presente em `patients-stub.component.ts:3` e `app.routes.ts:19` |
| Nota "Comunicação entre domínios" rotulada como padrão declarado não implementado | atendido | `docs/architecture.md:207`; `modules/appointments/` e `modules/billing/` não existem |
| §8: só verificar o comando de teste da Web, sem afirmar o não verificado | atendido | `docs/architecture.md:355-368`; todas as afirmações "verificado em 2026-11-15" foram de fato verificadas por mim (ver saída de testes e `npx vitest run`) |
| Versão 1.7.0, data 2026-11-15, entrada no §9, cabeçalho sincronizado | atendido | `docs/architecture.md:4-5,405` (entrada 1.7.0 em 2026-11-15; cabeçalho idêntico) |
| Escopo restrito a `docs/architecture.md` | atendido | `git status --short` → apenas `M docs/architecture.md`; `git diff 1be6a7d` toca só esse arquivo |
| Pendências da auditoria com marcador "ainda não implementado" junto de cada afirmação (ID10, ID14, ID17, ID18, ID20, ID21, §2.3, §2.4, §5, §6.3, §2) | atendido | `docs/architecture.md:54-58,66,88-94,96-106,120,131,137,157-163,174,183,187-207,311` — toda afirmação de não implementação está inline, junto da afirmação original |

## Apontamentos

_(nenhum)_

Observação sem caráter de apontamento: os nomes dos guards/interceptor no documento (`AuthGuard`, `GuestGuard`, `JwtInterceptor` — `docs/architecture.md:157`) correspondem aos `describe` dos specs, embora os exports no código sejam `authGuard`/`guestGuard`/`jwtInterceptor` (camelCase). A substância (existência e localização) confere; não reprovo por isso.

## Saída real resumida dos testes

**Web** (`npm test -w apps/web -- --no-watch`, executado em 2026-11-15):
- Test Files: **6 passed (6)** · Tests: **26 passed (26)** · Duration ~33.7s

**API** (`npm test -w apps/api`, por utilidade):
- Test Files: **3 passed (3)** · Tests: **19 passed (19)** · (após `prisma generate` OK)

**`npx vitest run` standalone em `apps/web`** (confirma a nota do §8, `docs/architecture.md:368`): 6 suítes/6 arquivos **falham** com `ReferenceError: describe is not defined`, 0 testes — exatamente como o documento declara.

O documento não contradiz a `spec.md`; toda afirmação nova foi conferida contra o repositório e passou; nenhum ID foi removido; os testes passam e provam o que o §8 declara.
