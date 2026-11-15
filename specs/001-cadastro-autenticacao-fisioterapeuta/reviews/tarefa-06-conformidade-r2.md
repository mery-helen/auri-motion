# Parecer de Conformidade — Tarefa 6 (rodada 2)

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA7 — Dado que estou com uma sessão ativa e ela expira enquanto uso o app, quando o sistema recebe uma resposta de não autorizado do servidor, então sou levado automaticamente à tela de login. (`spec.md:24`, reforço no abandono em `spec.md:41`) | atendido | `apps/web/src/app/core/interceptors/jwt.interceptor.ts:28-41` (401 de qualquer rota exceto `/auth/login` limpa o token e chama `router.navigate(['/login'])`); interceptor registrado globalmente em `apps/web/src/app/app.config.ts:11`; testes em `apps/web/src/app/core/interceptors/jwt.interceptor.spec.ts:70-99` (401 comum, 401 de login não sequestrado, status 0 de rede não desloga, sucesso não limpa) |
| CA8 — Dado que estou com uma sessão ativa e tento acessar as telas de login ou cadastro, quando o app verifica minha sessão válida, então sou redirecionado automaticamente para a tela de listagem de pacientes. (`spec.md:25`) | atendido | `guestGuard` aplicado a `/login` em `apps/web/src/app/app.routes.ts:8` e a `/register` em `apps/web/src/app/app.routes.ts:14`; lógica em `apps/web/src/app/core/guards/guest.guard.ts:9-11` — redireciona para `/patients` (rota provisória da Issue #2, marcada `// TODO #2` em `apps/web/src/app/app.routes.ts:19`, conforme premissa `spec.md:49`); teste em `apps/web/src/app/core/guards/guest.guard.spec.ts:40-47` |
| CA9 — Dado que não tenho sessão ativa e tento acessar qualquer tela protegida do app, quando o app verifica a ausência de sessão, então sou redirecionado para a tela de login. (`spec.md:26`) | atendido | `authGuard` na única rota protegida existente (`/patients`) em `apps/web/src/app/app.routes.ts:21`; lógica em `apps/web/src/app/core/guards/auth.guard.ts:9-13` — UrlTree para `/login` sem token; teste em `apps/web/src/app/core/guards/auth.guard.spec.ts:40-45` |

**Ponto recém-alterado (aceito na triagem da rodada 1):** confirmado correto. `jwt.interceptor.ts:20-26` lê o token do `TokenStore`, clona a requisição com `setHeaders: { Authorization: 'Bearer <token>' }` somente quando há token, e repassa a requisição original intacta quando não há — exatamente o que o apontamento do parecer de código pedia. Os dois casos têm teste com asserção sobre a requisição que chega a `next` (não mock testando mock): `jwt.interceptor.spec.ts:134-140` (anexa `Bearer`) e `jwt.interceptor.spec.ts:142-147` (não anexa nada). O comportamento CA7 permanece intacto — `catchError` opera sobre `outgoing`, e o erro original é relançado (`jwt.interceptor.ts:39`).

## Apontamentos
_(Nenhum.)_

## Saída real do comando de testes

Comando: `npm test -w apps/web -- --no-watch`

```
RUN  v4.1.12  C:/Users/meryh/auri-motion/apps/web
Test Files  6 passed (6)
     Tests  26 passed (26)
```

- Specs (arquivos de teste) executados: **6** — aprovados: **6**; falhos: **0**; pulados: **0**
- Testes executados: **26** — aprovados: **26**; falhos: **0**; pulados: **0**
- Desta tarefa: **11** testes em 3 arquivos — `jwt.interceptor.spec.ts` (6, sendo 2 novos da correção), `auth.guard.spec.ts` (3), `guest.guard.spec.ts` (2). Os 15 restantes pertencem às tarefas 4 e 5 e ao bootstrap, não alterados neste diff.
- O diff também traz `specs/.../reviews/tarefa-06-{codigo,conformidade,decisoes}-r1.md` (registros de triagem, sem julgamento de conformidade funcional).