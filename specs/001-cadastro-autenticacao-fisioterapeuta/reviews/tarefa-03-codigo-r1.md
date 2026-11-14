# Parecer de Código — Tarefa 3

**Veredito:** APROVADO

## Conformidade com os padrões

O diff implementa o endpoint `POST /auth/login` e a estratégia JWT respeitando a arquitetura declarada em `docs/architecture.md`:

- **ID6 (separação de camadas):** o `AuthController` recebe a requisição e delega ao `AuthService`; o serviço contém a lógica de negócio (busca de usuário, comparação de senha com `bcrypt`, assinatura de JWT); o `AuthModule` declara as dependências (`JwtModule`, `PassportModule`, `ConfigModule`, `PrismaModule`). O service nunca retorna entidade Prisma bruta — retorna `{ accessToken, expiresIn }`.
- **ID7 (DTO de entrada):** `LoginDto` usa `class-validator` (`@IsEmail`, `@IsNotEmpty`, `@IsString`). O `ValidationPipe` é aplicado nos testes com `whitelist: true` e `forbidNonWhitelisted: true`.
- **ID8 (Prisma ORM):** toda operação de leitura/escrita de usuário usa `PrismaService` injetado; nenhuma query SQL bruta.
- **ID9 (JWT):** `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt` declarados no `package.json` e na `architecture.md` §2. O `JwtStrategy` extrai o token do cabeçalho `Authorization: Bearer` e o `verify` callback retorna `{ userId: _payload.sub }` — payload contém apenas `sub`, conforme especificado. `JwtAuthGuard` e `CurrentUser` estão implementados nas pastas corretas (`common/guards/`, `common/decorators/`).
- **ID10 (envelopes):** o controller devolve os dados brutos; o interceptor global de resposta (envelope `{ data, meta }`) e o exception filter global (envelope `{ error: { code, message } }`) são configurados em `main.ts` (fora deste diff) e envolvem o resultado/erro em produção.
- **ID17 (credenciais):** `JWT_SECRET` e `JWT_EXPIRES_IN` aparecem apenas em `.env.example` com valores vazios — nenhum segredo é commitado no código.

**Critérios de aceite cobertos:**
- **CA2:** credenciais corretas retornam `accessToken` e `expiresIn` (1h via `JWT_EXPIRES_IN`) — testado no unitário e no e2e.
- **CA3:** e-mail inexistente e senha incorreta retornam a mesma mensagem genérica `"Credenciais inválidas"` (401), sem identificar o campo falho — testado no unitário e no e2e.

**Contagens reais dos testes (apps/api):**
- `npm test`: 3 arquivos, 18 testes, todos passando (incluindo os 2 novos testes de `AuthService.login` e validação de `RegisterDto`).
- `npm run test:e2e`: 2 arquivos, 3 testes, todos passando (incluindo os 3 novos testes de `POST /auth/login`).
- `npm run lint`: não pôde ser executado (restrição de ambiente — comando não liberado na sandbox).

## Apontamentos (bloqueiam)

Nenhum. Não há violação de camada, resposta fora do formato global, segredo em código, erro engolido silenciosamente, abstração desnecessária, duplicação de regra ou teste acoplado a detalhe de implementação no conteúdo deste diff.

## Sugestões (não bloqueiam)

- **`apps/api/src/modules/auth/strategies/jwt.strategy.ts:11`** — `secretOrKey: configService.get('JWT_SECRET')` usa `get()`, que retorna `string | undefined`, enquanto `auth.module.ts:17` usa `getOrThrow('JWT_SECRET')`. Embora o `JwtModule` já lance exceção no bootstrap se a variável faltar, usar `getOrThrow` aqui deixaria a intenção consistente e evitaria `secretOrKey: undefined` em tempo de execução.
- **`apps/api/src/modules/auth/auth.controller.spec.ts`** — os testes e2e configuram apenas `ValidationPipe` global, sem o `ResponseInterceptor` nem o `ExceptionFilter` globais de `main.ts`. Assim, validam o retorno cru do controller e não o envelope final `{ data, meta }` / `{ error: { code, message } }` exigido pelo ID10. Vale adicionar os interceptores/filtros globais no setup de teste para validar o contrato completo.
- **`apps/api/.env.example`** — `JWT_SECRET=` e `JWT_EXPIRES_IN=` estão vazios. Poderia conter valores de exemplo (placeholders) para orientar quem copia o arquivo.

## Observações fora do escopo deste diff

- O `lint` (`oxlint --type-aware`) não pôde ser rodado devido a restrição do ambiente; recomendo executá-lo localmente antes do merge, pois o CI (ID18) o exige.
- `JwtAuthGuard` e `CurrentUser` estão implementados mas ainda não aplicados a nenhuma rota protegida — isso caberá a tarefas subsequentes (rotas de pacientes, atendimentos, etc.), conforme o plano.

Nada foi editado.
