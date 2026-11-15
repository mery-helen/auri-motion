# Parecer de Código — Tarefa 6

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

1. **O `jwtInterceptor` nunca anexa o token à requisição — ele só trata o 401** — `apps/web/src/app/core/interceptors/jwt.interceptor.ts:21`
   Regra violada: `docs/architecture.md:151` (a pasta `core/` existe para os "Serviços singleton globais (AuthService, **HttpInterceptor JWT**)") combinada com `docs/architecture.md:85` (ID9 — autenticação por JWT) e `docs/architecture.md:63` ("Extrai e valida o token JWT do cabeçalho HTTP `Authorization: Bearer`"). O interceptor faz `next(req)` com a requisição intacta e, em nenhum ponto, clona o `req` com `setHeaders`.
   Prejuízo concreto: como ele foi registrado como interceptor global (`apps/web/src/app/app.config.ts:11`), **nenhuma** chamada do frontend sai autenticada — o `grep` por `Authorization`/`Bearer` em `apps/web` não encontra nenhum outro ponto que injete o cabeçalho. Na primeira feature que falar com endpoint protegido (US02, `GET /patients`), o `JwtAuthGuard` do backend responde 401, o mesmo `catchError` apaga o token e joga o usuário para `/login`: a sessão é destruída na primeira requisição, e a CA7 (expiração real por 1h) fica indistinguível desse defeito. O teste da tarefa não pega isso porque o `plan.md:69` só previa o caso 401; a suíte passa 24/24 com o interceptor oco.

## Sugestões (não bloqueiam)

- O teste do `TokenStore` está dentro de `auth.guard.spec.ts:54` — `describe('TokenStore')` num spec de guard.ii. Mover para `core/session/token.store.spec.ts` deixa o arquivo do guard só com o guard.
- `auth.guard.spec.ts:70-77` afirma o literal `'auri-motion.access-token'` no `localStorage`. Isso acopla o teste ao detalhe de implementação (renomear a chave quebra o teste sem mudar comportamento). Afirmar o round-trip via `TokenStore` já cobre o contrato.
- `jwt.interceptor.ts:26` usa `req.url.includes('/auth/login')` para não sequestrar o 401 do login. Funciona, mas `includes` é frouxo; um `endsWith`/comparação de path é mais previsível. Além disso, um 401 vindo do `POST /auth/register` (fora do escopo desta história, mas possível) desloga o usuário sem motivo.
- `jwt.interceptor.ts:29` — `router.navigate(['/login'])` é fogo-e-esquece (promessa não tratada) e não guarda `returnUrl`. Depois do relogin o usuário cai em `/patients`, não na tela onde estava. O `spec.md:41` aceita perder os dados do formulário, então não bloqueia, mas o `returnUrl` é barato.
- `auth.guard.ts:9` só checa presença do token, não expiração. Como a sessão dura 1h fixa, o token expirado passa pelo guard e o usuário só descobre no primeiro 401. Verificar `exp` no payload evitaria entrar na tela para ser expulso dela.

## Observações fora do escopo deste diff

- `apps/web/src/app/core/session/token.store.ts` não estava na lista de arquivos do `plan.md:70-77`. A criação é justificada: o diff remove a chave duplicada de `auth.service.ts` (antiga `TOKEN_STORAGE_KEY`, agora delegando em `auth.service.ts:45-55`), eliminando a segunda dona da chave. Sem prejuízo.
- `apps/web/src/app/app.routes.ts:27-31` (redirect de `''` para `login`) e as telas `login`/`register` não foram tocadas por esta tarefa; os guards foram aplicados às rotas já existentes sem alterar seus contratos.

## Saída real do comando de testes

Comando: `npm test -w apps/web -- --no-watch`

```
Test Files  6 passed (6)
     Tests  24 passed (24)
```

- Specs/arquivos de teste executados: **6**
- Testes executados: **24**
- Aprovados: **24** · Falhos: **0** · Pulados: **0**