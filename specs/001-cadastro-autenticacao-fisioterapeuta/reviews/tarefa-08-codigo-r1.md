# Parecer de Código — Tarefa 8

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- **Referência "(ID/§2.4)" na linha do `@nestjs/schedule` no §2** — `docs/architecture.md:55`. Não existe ID para o scheduler; a referência pretendia ser só `§2.4`. O prefixo "ID/" sugere um identificador inexistente e destoa do padrão das demais linhas da tabela (que citam `ID14`, `ID17`, etc.). Prejuízo: nenhum funcional — é imprecisão editorial num documento que se propõe a ser a régua do projeto.
- **§8 foi além de "apenas verificar o comando de teste da web"** — `docs/architecture.md:352-368`. A decisão do usuário limitava o §8 à verificação do comando web, mas o diff reescreveu a seção: substituiu `npx vitest run` por `npm test`, adicionou `ng test --no-watch` e `npm test -w apps/web -- --no-watch` e incluiu a nota de diagnóstico sobre o `describe is not defined`. Tudo verificado como verdadeiro contra o repositório (ver abaixo), e a seção de API e os comandos da raiz não foram tocados — portanto sem prejuízo concreto e dentro do espírito da tarefa. Registro apenas para transparência: se a próxima rodada exigir aderência literal à decisão, essa nota é candidata a ser enxuta­da.
- **Entrada 1.7.0 no §9 é um parágrafo único muito longo** — `docs/architecture.md:405`. Legibilidade, não correção.

## Observações fora do escopo deste diff

- A auditoria que motivou a tarefa segue com débitos declarados mas não resolvidos (por decisão do usuário, rotulados e não removidos): ID10, ID14, ID17 (validationSchema), ID18, ID20/ID21, ID19 "não verificável", ID/§2.3 e ID/§2.4. São mantidos de propósito como padrão pretendido, conforme a nota de `docs/architecture.md:66`.
- Pré-existente, não tocado pelo diff: a introdução do §2.2 declara "IDs 6–10, 14, 17, 18, 19, 20, 21" — a numeração não é contínua (não há ID11–13, ID15, ID16), o que é normal de documento vivo, mas pode confundir leitor novo.
- Verificação de escopo: `git status --short` mostra apenas `M docs/architecture.md`; `git diff --stat 1be6a7d` confirma 1 arquivo, +58/−46. Nenhum ID foi removido (ID6–ID10, ID14, ID17–ID21 todos presentes). Cabeçalho (1.7.0) e §9 (entrada 1.7.0) sincronizados. Todas as afirmações novas foram checadas contra o repo e se sustentam:
  - `schema.prisma` tem apenas `model User` (`apps/api/prisma/schema.prisma:15`);
  - `main.ts` registra somente `ValidationPipe` global (`apps/api/src/main.ts:7-13`); sem Swagger, sem Exception Filter;
  - `app.module.ts` usa `ConfigModule.forRoot({ isGlobal: true })` sem `validationSchema` (`apps/api/src/app.module.ts:8`);
  - `apps/api/src/common/` contém apenas `decorators/` e `guards/`; `modules/` apenas `auth/`; não existe `config/`;
  - `apps/api/package.json` não lista `mercadopago`, `@nestjs/schedule`, `@nestjs/swagger` nem `joi`; `@nestjs/config` presente (`^12.1.1`);
  - web: `core/` tem `guards/` (AuthGuard, GuestGuard), `interceptors/jwt.interceptor.ts`, `session/token.store.ts`; `AuthService` mora em `features/auth/auth.service.ts`; `shared/` inexistente; `patients-stub` com `// TODO #2` (`patients-stub.component.ts:3`); `appointments/` e `billing/` inexistentes;
  - `.github/workflows/` contém apenas `portao-de-entendimento.yml` (checa corpo de PR) e `site.yml` (guard `github.repository == 'utfpr-gp/utf-sdd-template'` — não roda neste repo); nenhum roda teste/lint;
  - não há `Dockerfile`, `render.yaml` nem `vercel.json` em lugar algum do repo; `.env` está no `.gitignore`;
  - `site.yml` e a linha "Site do método" no §3 são coerentes entre si.

## Saída real dos testes

- `npm test -w apps/web -- --no-watch`: `ng test --no-watch` → **6 arquivos de teste passaram (6), 26 testes passaram (26), 0 falhas, 0 pulados**; duração ~14,9s (2026-11-15). Confirma as anotações "verificado em 2026-11-15: 6 arquivos, 26 testes" em `docs/architecture.md:358` e `:361`.
- `npx vitest run` (apps/web, verificação da nota de `docs/architecture.md:368`): **6 suítes falham, 0 testes** — `ReferenceError: describe is not defined` em todas as 6. A nota do documento é precisa.
- `npm test -w apps/api` (informativo, fora do §8): **3 arquivos de teste passaram (3), 19 testes passaram (19)**.
