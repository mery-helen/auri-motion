# Parecer de Código — Tarefa 7

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

O diff, julgado contra o `docs/architecture.md`:

- **ID6** (separação de camadas — `docs/architecture.md:82`): `AuthModule` declara o `JwtModule` e delega a conversão ao helper; `AuthService` continua contendo a lógica e devolvendo DTO de resposta (`{ accessToken, expiresIn }`, `auth.service.ts:66,85`) — nenhuma entidade Prisma bruta atravessa a fronteira. Sem vazamento de camada.
- **ID9** (JWT — `docs/architecture.md:85`): payload permanece `{ sub: user.id }` (`auth.service.ts:79`); a emissão agora usa `expiresIn` numérico em segundos, nos dois pontos de assinatura via `@nestjs/jwt` (`auth.module.ts:20`, `auth.service.ts:75-83`), o que corrige o defeito da auditoria CA2 sem alterar o contrato de resposta (`expiresIn: 3600`).
- **ID17** (segredos — `docs/architecture.md:88`): `.env.example` ganha apenas `JWT_EXPIRES_IN=3600` com comentário de unidade — placeholder público, `JWT_SECRET` segue vazio. Nada sensível commitado.
- **Duplicação de regra**: a conversão `JWT_EXPIRES_IN` → segundos inteiros existe num único ponto (`jwt-expires-in.ts`), consumido pelo `JwtModule` (factory, `auth.module.ts:20`) e pelo `login()` (`auth.service.ts:75`). `grep` confirma que não há segunda cópia dessa regra no repo.
- **Teste não acoplado a implementação**: o teste novo (`auth.controller.spec.ts:179-200`) sobe o `AuthModule` real com `JwtModule` genuíno, faz login via HTTP e asserta `exp − iat === 3600` no token decodificado — comportamento observável, não detalhe interno. Sobrevive a refatorações internas do service.
- **Abstração**: o helper tem dois consumidores reais (module factory + service) e é o ponto único de validação acordado nas decisões do usuário — não é indireção gratuita.

## Sugestões (não bloqueiam)

- **Validação aceita notação exponencial/hexadecimal** — `jwt-expires-in.ts:3-5`. `Number()` converte `'1e3'` → 1000 e `'0x10'` → 16, e `Number.isInteger()` aprova ambos. Na prática quase ninguém escreve isso no `.env`, mas a garantia de "falha na subida" tem um furo estreito: `JWT_EXPIRES_IN=0x10` subiria com sessão de 16s sem erro. Um gate por `/^\d+$/` fecharia. Prejuízo concreto apenas em misconfiguração exótica — por isso sugestão, não apontamento.
- **Setup duplicado no spec** — `auth.controller.spec.ts:180-187` repete quase literalmente a construção de `passwordHash` + `prisma.user.findUnique.mockResolvedValue` do teste adjacente (`auth.controller.spec.ts:156-163`). Um helper local (`mockValidUser()`) reduziria ruído; estilo, sem prejuízo funcional.
- **Caminho de falha do helper sem teste** — `jwt-expires-in.ts:6` (throw) não é exercitado por nenhum spec; os três arquivos de teste cobrem só o caminho feliz com `'3600'`. Um spec unitário para `'abc'`, `'0'`, `'1.5'` e vazio protegeria a regra de validação contra regressão silenciosa.

## Observações fora do escopo deste diff

- `ConfigModule.forRoot({ isGlobal: true })` em `app.module.ts:8` segue **sem `validationSchema` (Joi)**, embora §2 (`docs/architecture.md:58`) e ID17 (`docs/architecture.md:88`) declarem Joi como validador de env. Pré-existente, intocado por este diff e fora das decisões do usuário (app.module.ts intocado) — candidata a Issue de manutenção (a validação real hoje é só a do helper, restrita a `JWT_EXPIRES_IN`; `DATABASE_URL` e `JWT_SECRET` sobem sem schema).
- A `.env.example` não termina com nova linha (mantido do estado anterior) — cosmético, ignorável.
- A decisão de o teste novo morar em `auth.controller.spec.ts` com `JwtModule` real diverge da letra do `plan.md:81` (que previa decodificar via `AuthService.login()`), mas corresponde à decisão explícita do usuário registrada no despacho — não configura defeito.

## Saída real resumida dos testes

Comando: `npm test -w apps/api` (executa `prisma generate` + `vitest run`)

```
Test Files  3 passed (3)
     Tests  19 passed (19)
  Duration  11.63s  (transform 755ms, import 20.05s, tests 3.78s)
  Failed: 0 · Skipped: 0
```

Workspace `apps/api` apenas; nenhum outro workspace foi executado. `git status --short` confirma que o diff cobre exatamente os 6 arquivos do escopo previsto (5 modificados + `jwt-expires-in.ts` novo).
