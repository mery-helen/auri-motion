# Parecer de Conformidade — Tarefa 5 (rodada 2)

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA2 — login válido autentica, abre sessão de 1h e redireciona para a listagem de pacientes (`spec.md:19`) | atendido | `apps/web/src/app/features/auth/login/login.component.ts:67-72` (chama `AuthService.login()`, `saveToken(accessToken)`, navega para `/patients` com `// TODO #2`), `apps/web/src/app/features/auth/auth.service.ts:41-47`, rota provisória em `apps/web/src/app/app.routes.ts:14-21`, stub `apps/web/src/app/features/patients/patients-stub/patients-stub.component.ts:3-15`; teste correspondente em `apps/web/src/app/features/auth/login/login.component.spec.ts:55-72` |
| CA3 — credenciais inválidas exibem mensagem genérica "Credenciais inválidas", sem especificar o campo (`spec.md:20`) | atendido | `apps/web/src/app/features/auth/login/login.component.ts:7,74-83,87-113` (401 → `readApiMessage` ou fallback `GENERIC_CREDENTIALS_ERROR`), exibição em `apps/web/src/app/features/auth/login/login.component.html:8-16`; teste verifica mensagem e ausência de frases específicas de campo em `apps/web/src/app/features/auth/login/login.component.spec.ts:74-106` |
| Premissa "Assume que" — rota provisória `/patients` com `// TODO #2` (`spec.md:49`) | atendido | `apps/web/src/app/app.routes.ts:15`, `apps/web/src/app/features/auth/login/login.component.ts:71`, `apps/web/src/app/features/patients/patients-stub/patients-stub.component.ts:3` |
| Arquivos/contrato efetivo da Tarefa 5 (`plan.md:57-65`) | atendido | `apps/web/src/app/features/auth/login/login.component.ts`, `apps/web/src/app/features/auth/login/login.component.html`, `apps/web/src/app/features/auth/login/login.component.spec.ts`, `apps/web/src/app/features/auth/auth.service.ts:41-55` (`login`, `saveToken`, `getToken`, `clearToken`), `apps/web/src/app/features/patients/patients-stub/patients-stub.component.ts`; rotas/entrada em `apps/web/src/app/app.routes.ts:4-21`, `apps/web/src/app/app.html:1` |
| Correção r1 #1 — registrar `provideHttpClient()` no bootstrap com teste de regressão (`reviews/tarefa-05-decisoes-r1.md:5`) | atendido | Provider registrado em `apps/web/src/app/app.config.ts:2,10`; testes de bootstrap verificam `HttpClient` disponível e renderização de `LoginComponent` com `AuthService` real em `apps/web/src/app/app.spec.ts:21-49` |
| Correção r1 #2 — remover placeholder "Hello, web" e ajustar `app.spec.ts`, mantendo `<router-outlet />` (`reviews/tarefa-05-decisoes-r1.md:6`) | atendido | `apps/web/src/app/app.html:1` contém apenas `<router-outlet />`; `apps/web/src/app/app.spec.ts:21-26` verifica ausência de "Hello, web" e presença de `router-outlet` |

## Apontamentos

Nenhum.

## Verificação
- `git diff c462ace` (working tree/índice, sem commit): inspecionado em `C:\Users\meryh\auri-motion`.
- `npm test -w apps/web -- --no-watch`: **3 arquivos / 15 testes passando** (inclui `app.spec.ts`, `login.component.spec.ts`, `register.component.spec.ts`).
