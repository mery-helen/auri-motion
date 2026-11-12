# Plano — Issue #1

## Decisões técnicas

- **Entidade nova:** `User` — campos `id` (cuid), `name`, `email` (único), `passwordHash`, `createdAt`. Criada via migration Prisma nesta Issue.
- **Módulo backend:** `src/modules/auth/` — `AuthModule`, `AuthController`, `AuthService`, `JwtStrategy`. `PrismaService` injetado no service.
- **DTOs:** `RegisterDto` (name, email, password com validações de força) e `LoginDto` (email, password) — ambos decorados com `class-validator`.
- **Contrato da API:**
  - `POST /auth/register` → `201 { data: { id, name, email, createdAt } }` (sem expor passwordHash)
  - `POST /auth/login` → `200 { data: { accessToken, expiresIn } }`
  - Erros seguem o envelope global `{ error: { code, message } }` (ID10).
- **JWT:** payload `{ sub: userId }`; expiração `1h`; configurado via `ConfigModule` (`JWT_SECRET`, `JWT_EXPIRES_IN`).
- **Módulo frontend:** `src/app/features/auth/` — componentes `RegisterComponent` e `LoginComponent`, `AuthService` (repositório HTTP), `AuthGuard` e `GuestGuard` (guards de rota), interceptor `JwtInterceptor` em `core/`.
- **Rota provisória de pacientes:** `/patients` aponta para componente stub com `// TODO #2` — desfazida pela Issue #2.

## Tarefas

- [ ] **Tarefa 1 — Criar model `User` e migration Prisma**
  - Cobre: passo técnico — destrava todas as tarefas de backend
  - Teste primeiro: teste de integração que conecta ao banco de teste, executa a migration e verifica que a tabela `User` existe com a constraint unique em `email`; falha enquanto o model não existir no schema.
  - Arquivos previstos:
    - `apps/api/prisma/schema.prisma` (model `User`)
    - migration gerada em `apps/api/prisma/migrations/`

- [ ] **Tarefa 2 — Endpoint `POST /auth/register` (cadastro + caminhos tristes)**
  - Cobre: CA1 (conta criada, senha não em texto puro), CA4 (e-mail duplicado), CA5 (campos obrigatórios), CA6 (formato inválido e senha fraca)
  - Teste primeiro: testes unitários do `AuthService.register()` — (a) cadastro válido retorna dados do usuário sem passwordHash; (b) e-mail duplicado lança conflito; (c) campos obrigatórios ausentes são rejeitados pelo DTO antes de chegar ao service; (d) senha que não atende os critérios de força é rejeitada. Todos falham enquanto o service e o DTO não existirem.
  - Arquivos previstos:
    - `apps/api/src/modules/auth/dto/register.dto.ts`
    - `apps/api/src/modules/auth/auth.service.ts`
    - `apps/api/src/modules/auth/auth.controller.ts`
    - `apps/api/src/modules/auth/auth.module.ts`
    - `apps/api/src/modules/auth/auth.service.spec.ts`
    - `apps/api/src/modules/auth/auth.controller.spec.ts` (e2e do endpoint)

- [ ] **Tarefa 3 — Endpoint `POST /auth/login` + estratégia JWT**
  - Cobre: CA2 (autenticação válida retorna token com expiração de 1h), CA3 (credenciais inválidas → mensagem genérica)
  - Teste primeiro: testes unitários do `AuthService.login()` — (a) credenciais corretas retornam `accessToken` e `expiresIn`; (b) e-mail inexistente retorna a mesma mensagem que senha errada (sem especificar qual campo falhou). Falham enquanto o service não implementar o login.
  - Arquivos previstos:
    - `apps/api/src/modules/auth/dto/login.dto.ts`
    - `apps/api/src/modules/auth/auth.service.ts` (complemento)
    - `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
    - `apps/api/src/common/guards/jwt-auth.guard.ts`
    - `apps/api/src/common/decorators/current-user.decorator.ts`
    - `apps/api/src/modules/auth/auth.service.spec.ts` (complemento)
    - `apps/api/src/modules/auth/auth.controller.spec.ts` (complemento e2e)

- [ ] **Tarefa 4 — Tela de cadastro no frontend**
  - Cobre: CA1 (formulário envia e redireciona para login), CA6 (mensagens de validação por campo), CA10 (erro de rede: mensagem exibida, campos mantidos)
  - Teste primeiro: testes do `RegisterComponent` — (a) submit com dados válidos chama `AuthService.register()` e, em sucesso, navega para `/login`; (b) submit com senha fraca exibe mensagem de validação no campo; (c) quando `AuthService.register()` rejeita com erro de rede, a mensagem de conectividade aparece e os campos permanecem preenchidos. Falham enquanto o componente e o service de repositório não existirem.
  - Arquivos previstos:
    - `apps/web/src/app/features/auth/register/register.component.ts`
    - `apps/web/src/app/features/auth/register/register.component.html`
    - `apps/web/src/app/features/auth/auth.service.ts` (repositório HTTP)
    - `apps/web/src/app/features/auth/register/register.component.spec.ts`

- [ ] **Tarefa 5 — Tela de login + gerenciamento de sessão no frontend**
  - Cobre: CA2 (login válido abre sessão de 1h e redireciona para `/patients`), CA3 (credenciais inválidas exibem "Credenciais inválidas")
  - Teste primeiro: testes do `LoginComponent` — (a) submit com credenciais válidas chama `AuthService.login()`, armazena o token e navega para `/patients`; (b) quando o service retorna erro de credenciais, a mensagem genérica é exibida sem especificar o campo. Falham enquanto o componente não existir.
  - Arquivos previstos:
    - `apps/web/src/app/features/auth/login/login.component.ts`
    - `apps/web/src/app/features/auth/login/login.component.html`
    - `apps/web/src/app/features/auth/auth.service.ts` (complemento: `login()`, `saveToken()`, `getToken()`, `clearToken()`)
    - `apps/web/src/app/features/auth/login/login.component.spec.ts`
    - `apps/web/src/app/features/patients/patients-stub/patients-stub.component.ts` (`// TODO #2`)

- [ ] **Tarefa 6 — Guards de rota e interceptor JWT no frontend**
  - Cobre: CA7 (sessão expirada → redirecionado para login), CA8 (já autenticado em /login ou /cadastro → redirecionado para /patients), CA9 (sem sessão em rota protegida → redirecionado para login)
  - Teste primeiro: testes unitários do `AuthGuard`, `GuestGuard` e `JwtInterceptor` — (a) `AuthGuard` bloqueia rota sem token e redireciona para `/login`; (b) `GuestGuard` bloqueia `/login` com token válido e redireciona para `/patients`; (c) `JwtInterceptor` ao receber resposta 401 limpa o token e redireciona para `/login`. Todos falham enquanto as classes não existirem.
  - Arquivos previstos:
    - `apps/web/src/app/core/guards/auth.guard.ts`
    - `apps/web/src/app/core/guards/guest.guard.ts`
    - `apps/web/src/app/core/interceptors/jwt.interceptor.ts`
    - `apps/web/src/app/app.routes.ts` (rotas com guards aplicados)
    - `apps/web/src/app/core/guards/auth.guard.spec.ts`
    - `apps/web/src/app/core/guards/guest.guard.spec.ts`
    - `apps/web/src/app/core/interceptors/jwt.interceptor.spec.ts`

## Critérios sem tarefa

_(Vazio — todos os CAs cobertos.)_

