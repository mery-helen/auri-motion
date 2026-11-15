# Parecer de Conformidade — Tarefa 7

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA2 — "abre uma sessão com duração de 1 hora" (parte desta tarefa; redirecionamento pós-login é frontend, fora deste diff) | atendido | `apps/api/src/modules/auth/auth.controller.spec.ts:179-200` (teste `exp − iat = 3600` com `JwtModule` real via `AuthModule`), `apps/api/src/modules/auth/jwt-expires-in.ts:1-10`, `apps/api/src/modules/auth/auth.module.ts:19-22`, `apps/api/src/modules/auth/auth.service.ts:75-85` |
| CA2 — resposta `expiresIn` continua `3600` (decisão da triagem) | atendido | `apps/api/src/modules/auth/auth.service.ts:85`, `apps/api/src/modules/auth/auth.service.spec.ts:179` (`expiresIn: 3600`), `apps/api/src/modules/auth/auth.controller.spec.ts:170-173` |
| CA2 — redirecionamento para listagem de pacientes | fora desta tarefa | nenhum arquivo de frontend no diff; spec.md:49 registra rota provisória `// TODO #2` |
| Decisão de triagem — único ponto de conversão com validação e falha na subida, usado por `auth.module.ts` e `auth.service.ts` | atendido | `apps/api/src/modules/auth/jwt-expires-in.ts:1-10` (lança `Error` em valor inválido); usado em `auth.module.ts:20` (factory do `JwtModule`, executada na subida) e `auth.service.ts:75-77` |
| Decisão de triagem — `.env.example` documenta a unidade | atendido | `apps/api/.env.example:4-5` (`# em segundos (3600 = 1 hora)`, `JWT_EXPIRES_IN=3600`) |
| Decisão de triagem — nenhum teste depende do `.env` real | atendido | `auth.controller.spec.ts:27-37` e `51-59` (`ConfigService` mockado com `JWT_EXPIRES_IN: '3600'`); `auth.service.spec.ts` mocka `JwtService`/`ConfigService` |
| CA1, CA3–CA10 | fora desta tarefa | não tocados pelo diff |
| Glossário do `docs/architecture.md` | atendido (sem divergência) | busca por `JWT_EXPIRES_IN`/`expiresIn`/`jwt-expires-in` em `docs/` retornou nenhum resultado divergente |

Observações de conformidade (não-bloqueantes, registradas para o fluxo):

- O `expiresIn` é passado tanto no `signOptions` do módulo (`auth.module.ts:19-22`) quanto explicitamente no `signAsync` (`auth.service.ts:78-83`); o valor é idêntico (3600) e as duas chamadas passam pelo mesmo parser — é exatamente a duplicação de uso decidida na triagem, não escopo inflado. O `signAsync` sobrescreve o `signOptions` do módulo, mas ambos concordam, então não há comportamento divergente.
- `jwt-expires-in.ts:6-8` valida com `Number.isInteger(parsed) && parsed > 0`, cobrindo o caso `'1h'` (vira `NaN` → `Error` na subida) e o caso `'3600'` (vira 3600 segundos inteiros, não ms). É o comportamento que a auditoria reprovou, corrigido.
- O teste novo usa `jwtService.decode` (sem verificar assinatura), mas a assinatura já é verificada no teste vizinho (`auth.controller.spec.ts:175-176`), e a asserção exigida pela tarefa (`exp − iat = 3600`) foi feita sobre o token real emitido pelo endpoint. Não é asserção fraca.

## Apontamentos

Nenhum. Nenhum critério da tarefa foi violado; nada no diff excede o que a triagem decidiu.

## Saída real dos testes (`npm test -w apps/api`)

```
Test Files  3 passed (3)
     Tests  19 passed (19)
  Duration  12.45s
```

- Specs: 3 executados, 3 aprovados, 0 falhos, 0 pulados
- Tests: 19 executados, 19 aprovados, 0 falhos, 0 pulados/todo
