# Parecer de Código — Tarefa 5 (rodada 2)

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- Nenhuma.

## Observações fora do escopo deste diff

- Sugestões nº 2–11 do parecer r1 permanecem deliberadamente não tratadas nesta tarefa (conforme triagem r1) e não foram reabertas.
- Observações fora do escopo registradas no r1 (ausência de `proxy.conf.json`/`vercel.json`, `expiresIn` potencialmente `null` no contrato real, token expirado permanecendo no storage, `AuthService` em `features/auth/` vs `core/`, paleta em hex repetida nos templates) continuam candidatas a Issue de manutenção, sem relação com as correções desta rodada.

## Verificação das correções da rodada 2

1. **`provideHttpClient()` no bootstrap (aceito r1, bloqueante anterior):** `apps/web/src/app/app.config.ts:1,9` registra `provideHttpClient()` nos providers da aplicação. O `AuthService` (`apps/web/src/app/features/auth/auth.service.ts`) depende de `HttpClient`; a correção elimina a causa do `NG0201/NullInjectorError` apontada no r1. `apps/web/src/app/app.spec.ts` adiciona regressão em "Bootstrap da aplicação (appConfig)": injeta `HttpClient` com `providers: [...appConfig.providers]` e renderiza `LoginComponent` com o `AuthService` real, confirmando que o provider está disponível no bootstrap. **Corretamente implementada.**
2. **Remoção do placeholder "Hello, web 🎉" e ajuste do spec do app (aceito r1):** `apps/web/src/app/app.html` passa a conter apenas `<router-outlet />` (placeholder Angular CLI removido). `apps/web/src/app/app.spec.ts` deixa de validar o texto do placeholder e passa a verificar `textContent` sem "Hello, web" e a presença de `router-outlet`. **Corretamente implementada.**

## Conformidade com `docs/architecture.md`

- Sem violação de camadas introduzida: `provideHttpClient()` é registrado na configuração de bootstrap (`app.config.ts`), e o acesso HTTP continua encapsulado no `AuthService` (componentes não falam com o servidor). Nenhum segredo/URL de ambiente, contrato de API ou tratamento de erro foi alterado nesta rodada.

## Execução

- `git diff c462ace` — inspecionado integralmente (working tree/índice, sem commit).
- `npm test -w apps/web -- --no-watch` — **passou** (3 arquivos de teste, 15 testes).
- `npm run lint -w apps/web` — **não executado**: o comando não foi permitido pelo ambiente/shell desta sessão (restrito a `git diff/log/status`, `ls`, `cat`, `npm test*`, `npm run test*`, `npx vitest/jest*`), impossibilitando a checagem de lint nesta revisão (ID18). Recomenda-se rodá-lo antes do merge.
