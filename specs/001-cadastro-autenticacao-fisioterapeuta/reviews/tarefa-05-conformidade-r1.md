# Parecer de Conformidade — Tarefa 5

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| **CA2** — login válido autentica, abre sessão de 1h e redireciona para a listagem de pacientes (spec.md:19) | atendido | `apps/web/src/app/features/auth/login/login.component.ts:67-72` (chama `login()`, `saveToken()`, `navigate(['/patients'])`); `apps/web/src/app/features/auth/auth.service.ts:41-47`; rota em `apps/web/src/app/app.routes.ts:14-21`; duração de 1h vem do JWT do backend (`apps/api/src/modules/auth/auth.service.ts:74-82`) — o frontend persiste o token, conforme o plano (`plan.md:59`) |
| **CA3** — recusa com mensagem genérica "Credenciais inválidas", sem especificar o campo (spec.md:20) | atendido | `apps/web/src/app/features/auth/login/login.component.ts:74-83` + `99-113` (lê `err.error.message`, com fallback na constante `GENERIC_CREDENTIALS_ERROR`); mensagem única em `login.component.html:8-16`; o backend responde a mesma mensagem para e-mail inexistente e senha errada (`apps/api/src/modules/auth/auth.service.ts:70-72`) |
| **Teste do 401** — confirma a mensagem genérica **e** a ausência de mensagem específica de campo (decisão #4) | atendido | `apps/web/src/app/features/auth/login/login.component.spec.ts:74-106` — asserção dupla: `toContain('credenciais inválidas')` e negativa contra as 5 frases de campo, no erro e no texto inteiro da tela; `saveToken`/`navigate` não chamados (linhas 91-92) |
| **Teste do login válido** — chama `AuthService.login()`, armazena o token e navega para `/patients` (`plan.md:59`) | atendido | `apps/web/src/app/features/auth/login/login.component.spec.ts:55-72` |
| **Premissa "Assume que"** — rota provisória com `// TODO #2` no código de redirecionamento (spec.md:49) | atendido | `login.component.ts:71`; `app.routes.ts:15`; `apps/web/src/app/features/patients/patients-stub/patients-stub.component.ts:4` |
| **Arquivos previstos da Tarefa 5** (`plan.md:60-65`) | atendido | `login.component.ts`, `login.component.html`, `login.component.spec.ts`, `patients-stub.component.ts` criados; `auth.service.ts` com `login()`, `saveToken()`, `getToken()`, `clearToken()` (`auth.service.ts:41-55`) |
| **Contrato efetivo da API** — `login()` tipado `Observable<{ accessToken, expiresIn }>`, mensagem em `err.error.message`, sem envelope (decisão #1) | atendido | `auth.service.ts:23-26, 41-43` confere com `apps/api/src/modules/auth/auth.controller.ts:15-19`; `apps/api/src/main.ts` não registra interceptor/filtro global, logo o erro do NestJS chega como `err.error.message` |
| **Rotas em `app.routes.ts`** — `/login`, `/register`, `/patients` (stub) e raiz, com lazy loading (decisão #2) | atendido | `apps/web/src/app/app.routes.ts:3-27` (`loadComponent` nas três rotas; raiz `redirectTo: 'login'`); rotas registradas em `app.config.ts:8` com `RouterOutlet` em `app.ts:5` |
| **CA7 / CA8 / CA9** — guards, `JwtInterceptor`, proxy | fora desta tarefa | decisão #3 — Tarefa 6; nada disso aparece no diff |
| **CA1 / CA4 / CA5 / CA6 / CA10** | fora desta tarefa | Tarefas 2, 3 e 4 (já entregues, commit `c462ace`) |

## Apontamentos

Nenhum.

_Verificações executadas: `npm test -w apps/web -- --no-watch` → 3 arquivos / 13 testes passando, incluindo os 4 do `LoginComponent` (CA2, CA3, instância e campos obrigatórios). O comando `npm run lint -w apps/web` não consta da lista de comandos liberados neste ambiente e não foi executado — lint é domínio do revisor de código, não deste parecer._
