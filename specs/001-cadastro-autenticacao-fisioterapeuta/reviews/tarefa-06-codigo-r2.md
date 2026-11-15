# Parecer de Código — Tarefa 6 (rodada 2)

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
_(Nenhum.)_

Verificação do ponto recém-alterado (item aceito da rodada 1): o `jwtInterceptor` agora clona a requisição com `Authorization: Bearer <token>` quando há token no `TokenStore` e repassa a requisição original quando não há — `jwt.interceptor.ts:22-26`. A regra vive num único ponto do repo (grep por `Authorization`/`Bearer` não acha nenhum outro injetor), e os dois casos estão cobertos por teste (`jwt.interceptor.spec.ts:134-147`). O 401 continua sendo tratado sem engolir a falha (rethrow em `jwt.interceptor.ts:39`) e sem duplicar dono da chave (`AuthService` delega ao `TokenStore`). Camadas respeitadas: `core/` não importa `features/`; o registro em `app.config.ts:9-12` usa `provideHttpClient(withInterceptors(...))`, forma correta para interceptor funcional. O bloqueador da rodada 1 está resolvido de forma completa, não cosmética. Não encontrei prejuízo concreto restante no diff; o que sobrou é calibragem de sugestão (abaixo).

## Sugestões (não bloqueiam)
- Itens já decididos na rodada 1 (sugestões 2–5 de `tarefa-06-codigo-r1.md`, explicitamente não promovidos e não tratados nesta tarefa — apenas registro): `req.url.includes('/auth/login')` frouxo e 401 do `/auth/register` deslogando sem motivo (`jwt.interceptor.ts:33`); `router.navigate` fogo-e-esquece e sem `returnUrl` (`jwt.interceptor.ts:36`); guards checando só presença do token, não expirção `exp` (`auth.guard.ts:9`); spec do `TokenStore` dentro de `auth.guard.spec.ts:54-78` e asserts do literal `'auri-motion.access-token'` acoplados à implementação (`auth.guard.spec.ts:70,75` e `jwt.interceptor.spec.ts:82`).
- `AuthService.getToken()` e `AuthService.clearToken()` (`auth.service.ts:49-55`) não têm nenhum consumidor no repo — delegação de um caso só, dois caminhos para a mesma operação sem regra declarada de qual usar. Sem prejuízo hoje (compila, suíte verde), mas vale remover ou unificar o fluxo de sessão (`login.component.ts:70` usa `authService.saveToken`; guards e interceptor usam `TokenStore` direto) na próxima tarefa que tocar auth.
- O interceptor anexa o Bearer a **qualquer** chamada do app, incluindo eventual URL absoluta para terceiros. Hoje todas as requisições são relativas same-origin (`/auth`, `/patients`), então é nota preventiva: se surgir `baseUrl` absoluta ou chamada a serviço externo a partir do browser, restringir a anexação à origem da própria API.
- `captureRequest` em `jwt.interceptor.spec.ts:60` inscreve no observable sem `error`-handler; inofensivo com `EMPTY`, mas se o `next` mudasse para um erro, o teste falharia com exceção não tratada em vez de um `expect` legível.

## Observações fora do escopo deste diff
- `core/session/token.store.ts` não constava nos arquivos previstos do `plan.md:70-77`; a criação é justificada e já foi aceita na rodada 1 (elimina a chave duplicada de `auth.service.ts`). Sem prejuízo.
- O diff inclui os pareceres de código/conformidade e o `tarefa-06-decisoes-r1.md` em `specs/.../reviews/` — artefatos de processo, não código; o "24 testes" citado em `tarefa-06-codigo-r1.md` era o número correto da rodada 1 (hoje são 26, com os 2 testes novos do header). Não é a corrigir aqui.
- Pré-existente, não tocado por este diff: `login.component.ts:70` salva o token via `AuthService.saveToken` em vez de `TokenStore` direto — fachada dupla para a mesma operação; candidato a limpeza quando o logout/sessão for implementado (fora desta história, que não tem logout client-side).
- Rota-raiz `''` → `/login` passa pelo `guestGuard` com sessão ativa e desvia para `/patients` (`app.routes.ts:27-31`); funcional, sem loop, apenas um redirect a mais no caminho feliz.

## Saída real do comando de testes

Comando: `npm test -w apps/web -- --no-watch`

```
Test Files  6 passed (6)
     Tests  26 passed (26)
```

- Specs/arquivos de teste executados: **6**
- Testes executados: **26**
- Aprovados: **26** · Falhos: **0** · Pulados: **0**
- Delta em relação à rodada 1 (24): os 2 testes novos do item recém-alterado (`anexa Authorization: Bearer <token>...` e `não anexa Authorization quando não há token...`). Os 24 demais seguem os mesmos.