# Parecer de Código — Tarefa 2

**Veredito:** APONTAMENTOS

Escopo revisado: `git diff 1b3f08ebc1e3e7d1d94cf6597a8df5d3ec13c9da` (12 arquivos, incluindo `package-lock.json`). Rodei em `apps/api`: `npm test` → 3 arquivos / 12 testes passando; `npm run test:e2e` → 2 arquivos / 3 testes passando. **Não rodei `npm run lint`**: a allowlist desta sessão libera só `git diff/log/status`, `ls`, `cat`, `npm test*` e `npx vitest/jest`; `npm run lint` foi bloqueado antes de executar, então esse eixo sai incompleto por permissão, não por omissão.

## Conformidade com os padrões

- **Separação de camadas — OK.** `auth.controller.ts:9-12` só recebe e delega; a regra de negócio (checagem de duplicidade, hash) está toda em `auth.service.ts:19-43`. Nenhum acesso a banco no controller.
- **ID7 — OK.** `RegisterDto` decorado com `class-validator` (`register.dto.ts:5-21`) e `ValidationPipe` global com `whitelist`/`forbidNonWhitelisted` em `main.ts:7-13`.
- **ID6 (núcleo) — OK.** O service não devolve entidade Prisma bruta: monta explicitamente `{ id, name, email, createdAt }` (`auth.service.ts:37-42`), sem `passwordHash`.
- **ID8 — OK.** Consultas exclusivamente via `PrismaService`.
- **CA1/CA4 no comportamento — OK.** Hash com bcrypt e salt (`auth.service.ts:28`), `ConflictException` para e-mail existente (`:24-26`). Os testes provam o hash persistido (`auth.service.spec.ts:66-70`) e que o 409 não cria usuário (`:82-83`).
- **Teste primeiro — OK.** Existem testes de DTO isolados (`auth.service.spec.ts:87-124`) e e2e do endpoint cobrindo 201, 409, 400 de campos, 400 de e-mail e 400 de senha fraca (`auth.controller.spec.ts:58-133`).
- **Sem segredo hardcoded — OK.** `DATABASE_URL` vem do ambiente (`prisma.service.ts:12`); nenhuma URL/chave no diff.

## Apontamentos (bloqueiam)

1. **O diff passa a depender do cliente Prisma gerado, mas não existe passo de geração reprodutível** — `apps/api/src/prisma/prisma.service.ts:3` e `apps/api/package.json:9-23`.
   Regra violada: `docs/architecture.md:330-344` (§8 declara `npm test`/`npm run test:e2e` como a forma de rodar a suíte) e `:89` (ID18 — CI roda Vitest/oxlint no push/PR). O §3 (`:116`) e o `.gitignore:39` confirmam que `apps/api/generated/` é artefato ignorado.
   Prejuízo concreto: este é o primeiro arquivo do repo a importar `../../generated/prisma/client.js`. O `generated/` está fora do Git e não há `postinstall`, `pretest`, `prebuild` nem script `prisma generate` em `apps/api/package.json` ou no root. O `@prisma/client` 7.10.1 instalado não tem `postinstall` e o CLI `prisma` só tem `preinstall` (conferi os `package.json` em `node_modules`). Num clone limpo — e no job de CI desenhado em `docs/guia-sdd.md:1421-1428`, que roda `npm ci` + `migrate deploy` + `npm test` sem `generate` — a suíte falha na resolução do import antes de rodar o primeiro teste. Aqui ela só passa porque o cliente foi gerado manualmente na máquina.
   Fechamento barato para o implementador: ligar `prisma generate` a `postinstall`/`pretest`/`prebuild`.

## Sugestões (não bloqueiam)

1. **Duplicidade sujeita a corrida** — `auth.service.ts:20-35`. O `findUnique` seguido de `create` deixa uma janela: duas requisições simultâneas para o mesmo e-mail passam pela checagem e a segunda estoura `P2002` no banco, virando 500 em vez de 409. Capturar `PrismaClientKnownRequestError` com `code === 'P2002'` e relançar `ConflictException` fecha o CA4 sob concorrência.
2. **E-mail não é normalizado** — `auth.service.ts:20-22,29-34` e `register.dto.ts:10-12`. `Ana@Example.com` e `ana@example.com` passam pelo `@IsEmail` e pela constraint unique (o Postgres compara case-sensitive por padrão), criando duas contas para o mesmo endereço. Um `@Transform(({ value }) => value?.trim().toLowerCase())` no DTO (ou normalização no service) alinha com a RN02.
3. **O regex de senha aceita espaço como “caractere especial”** — `register.dto.ts:3`. `"Senha 123"` satisfaz `[^A-Za-z0-9]` e passa, embora espaço dificilmente seja o “caractere especial” do CA6; além disso, só reconhece maiúscula ASCII. Restringir a classe (ex.: `[^A-Za-z0-9\s]`) ou enumerar os especiais aceitos deixa a mensagem de erro honesta.
4. **`PrismaService` lê `process.env` direto** — `apps/api/src/prisma/prisma.service.ts:12`. O ID17 (`architecture.md:88`) manda carregar variáveis sensíveis via `ConfigModule` com validação. Como o `ConfigModule` já é global, um `ConfigService.getOrThrow('DATABASE_URL')` falha no boot com mensagem clara, em vez de entregar `undefined` ao adapter `pg`. A ausência do schema Joi é pré-existente, mas este provider é novo no diff.
5. **O contrato de resposta mora no service, não em um DTO** — `auth.service.ts:6-11`, importado pelo controller em `auth.controller.ts:2`. O ID6 fala em “DTO de resposta”; hoje o tipo `RegisteredUser` é um alias no próprio service, o que acopla a camada de apresentação ao arquivo de regra. Mover para `dto/registered-user.dto.ts` (idealmente classe) também prepara o ID14/Swagger, que precisará de uma classe com decoradores de schema.
6. **Configuração do `ValidationPipe` duplicada entre produção e teste** — `main.ts:7-13` e `auth.controller.spec.ts:44-50`. Hoje estão idênticas, mas se o bootstrap ganhar `transformOptions`/`exceptionFactory`, o teste continuará validando a configuração antiga e pode passar enquanto o endpoint real se comporta diferente. Extrair um `createValidationPipe()` e reutilizar nos dois pontos elimina a deriva.
7. **Mensagens duplicadas para campo ausente** — `register.dto.ts:6-7,14-15`. Empilhar `@IsString` + `@IsNotEmpty` com a mesma `message` faz o `ValidationPipe` devolver “Nome é obrigatório.” duas vezes para o mesmo campo. O `arrayContaining` do teste esconde isso; o cliente recebe a lista inflada. Diferenciar as mensagens (tipo × obrigatoriedade) ou manter um decorator só por campo resolve.
8. **O e2e raiz passou a abrir conexão de banco** — `test/app.e2e-spec.ts:10-17`, que não está no diff mas é afetado por ele. Como `AppModule` agora importa `AuthModule` → `PrismaModule`, o teste do `GET /` instancia o `PrismaService` real e conecta no banco. Continua passando, porém um teste de “Hello World” não deveria depender de `DATABASE_URL`; um `overrideProvider(PrismaService)` ali mantém o teste isolado.

## Observações fora do escopo deste diff

- **ID10 adiado por decisão do despacho.** A resposta de sucesso ainda é o objeto cru (`auth.controller.spec.ts:73-78` espera `{ id, name, email, createdAt }`) e o erro é o formato padrão do Nest (`response.body.message`), não `{ error: { code, message } }`. Fica registrado como observação e candidato a Issue de manutenção, não como apontamento.
- **ID14/Swagger ainda não existe**: `@nestjs/swagger` está declarado em `architecture.md:56`, mas não instalado nem configurado. Os DTOs já são classes, o que ajuda quando o Swagger entrar.
- **`ConfigModule` sem `validationSchema` (Joi)** — `app.module.ts:8` é pré-existente; o ID17 só será cumprido quando a validação de env for adicionada.
- **`.github/workflows/` ainda não existe** — o ID18 está declarado, mas o pipeline não foi materializado; quando for, o `prisma generate` do apontamento 1 precisa entrar antes do `npm test`.
- **Lint não executado** — bloqueio de permissão da sessão, conforme explicado no topo. Se o lint for critério obrigatório deste fluxo, precisa rodar fora deste sandbox.

Nada foi editado.
