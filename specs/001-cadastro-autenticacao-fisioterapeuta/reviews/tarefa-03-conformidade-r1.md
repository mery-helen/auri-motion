# Parecer de Conformidade — Tarefa 3

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA2 — login válido autentica, retorna token e sessão de 1 hora | atendido | `apps/api/src/modules/auth/auth.controller.ts:15-19`; `apps/api/src/modules/auth/auth.service.ts:65-83`; `apps/api/src/modules/auth/auth.service.spec.ts:164-184`; `apps/api/src/modules/auth/auth.controller.spec.ts:155-177`; `apps/api/src/modules/auth/strategies/jwt.strategy.ts`; `apps/api/src/common/guards/jwt-auth.guard.ts`; `apps/api/src/common/decorators/current-user.decorator.ts` |
| CA3 — credenciais inválidas → mensagem genérica "Credenciais inválidas" | atendido | `apps/api/src/modules/auth/auth.service.ts:70-72`; `apps/api/src/modules/auth/auth.service.spec.ts:186-214`; `apps/api/src/modules/auth/auth.controller.spec.ts:179-206` |

## Apontamentos

Sem apontamentos.

**Evidência de execução dos testes (contagens reais, em `apps/api`):**
- `npm test` (unitários): 3 arquivos, 18 testes, todos passed.
- `npm run test:e2e`: 2 arquivos, 3 testes (os 3 novos de login), todos passed.

**Fundamento do veredito:**
- CA2: `POST /auth/login` retorna `200 { accessToken, expiresIn }`; `AuthService.login()` busca o usuário por e-mail, compara a senha com `bcrypt` e assina o JWT com payload `{ sub: user.id }` e `expiresIn` vindo de `JWT_EXPIRES_IN` (`3600` = 1h). O e2e verifica ainda o payload decodificado (`{ sub: 'user-1' }`). A parte de "redirecionar para a tela de listagem de pacientes" é de frontend (Tarefa 5) e está expressamente diferida no spec ("Assume que" — rota provisória `// TODO #2`, Issue #2), fora desta tarefa de backend.
- CA3: `login()` lança `UnauthorizedException('Credenciais inválidas')` tanto para e-mail inexistente quanto para senha errada (mesma mensagem, sem identificar o campo). Os testes unitário e e2e confirmam a mensagem idêntica nos dois casos e que `signAsync` não é chamado em falha.
- Não há critério da CA deixado de implementar, não há teste que apenas "testa o mock" (asserções verificam comportamento real e payload), e não há escopo inflado além do listado no plan para a Tarefa 3. O JWT respeita o ID9 da architecture (payload apenas com `sub`).
