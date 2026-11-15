# Parecer de Conformidade — Tarefa 4

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — Submissão com dados válidos envia payload e redireciona para `/login` | atendido | apps/web/src/app/features/auth/register/register.component.ts:84-89, apps/web/src/app/features/auth/register/register.component.spec.ts:41-66 |
| CA6 — Mensagens de validação específicas por campo (e-mail em formato inválido e senha sem critérios de força) | atendido | apps/web/src/app/features/auth/register/register.component.ts:49-71, apps/web/src/app/features/auth/register/register.component.html:43-89, apps/web/src/app/features/auth/register/register.component.spec.ts:68-102 |
| CA10 — Falha por erro de rede/timeout exibe mensagem de conectividade e mantém campos preenchidos | atendido | apps/web/src/app/features/auth/register/register.component.ts:114-121, apps/web/src/app/features/auth/register/register.component.html:8-16, apps/web/src/app/features/auth/register/register.component.spec.ts:127-156 |

## Apontamentos

