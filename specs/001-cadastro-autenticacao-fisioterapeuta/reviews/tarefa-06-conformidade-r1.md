# Parecer de Conformidade — Tarefa 6

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA7 — sessão expira e resposta 401 do servidor leva automaticamente ao login | atendido | `apps/web/src/app/core/interceptors/jwt.interceptor.ts:21-31` (interceptor registrado em `apps/web/src/app/app.config.ts:12`; teste em `apps/web/src/app/core/interceptors/jwt.interceptor.spec.ts:46-60`) |
| CA8 — sessão ativa ao acessar `/login` ou `/register` redireciona para listagem de pacientes | atendido | `apps/web/src/app/core/guards/guest.guard.ts:11-13` (guarda aplicado nas duas rotas em `apps/web/src/app/app.routes.ts:8` e `apps/web/src/app/app.routes.ts:14`; destino provisório `/patients` com `// TODO #2` em `apps/web/src/app/app.routes.ts:19-20`; teste em `apps/web/src/app/core/guards/guest.guard.spec.ts:40-47`) |
| CA9 — sem sessão em tela protegida redireciona ao login | atendido | `apps/web/src/app/core/guards/auth.guard.ts:11-13` (guarda na rota protegida em `apps/web/src/app/app.routes.ts:21`; teste em `apps/web/src/app/core/guards/auth.guard.spec.ts:40-45`) |

## Apontamentos
_(Nenhum.)_

## Saída real do comando de testes

Comando: `npm test -w apps/web -- --no-watch`

```
Test Files  6 passed (6)
     Tests  24 passed (24)
```

- Specs (arquivos de teste) executados: **6** — aprovados: **6**; falhos: **0**
- Testes executados: **24** — aprovados: **24**; falhos: **0**; pulados: **0**
- Dos 24, **9** são desta tarefa, em 3 arquivos: `auth.guard.spec.ts` (3), `guest.guard.spec.ts` (2), `jwt.interceptor.spec.ts` (4). Os 15 restantes são das tarefas 4 e 5 e do bootstrap (`app.spec.ts`, `login.component.spec.ts`, `register.component.spec.ts`), não alterados no diff.