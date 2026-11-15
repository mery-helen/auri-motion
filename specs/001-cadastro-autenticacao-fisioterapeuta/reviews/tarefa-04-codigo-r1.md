# Parecer de Código — Tarefa 4

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum. O código respeita integralmente as regras arquiteturais declaradas para o frontend Angular 22 e a separação de responsabilidades.

## Sugestões (não bloqueiam)
- **Extração de mensagem de erro compatível com o envelope ID10** — `apps/web/src/app/features/auth/register/register.component.ts:100-110`:
  No tratamento de erro em `register.component.ts`, a extração de mensagem da API verifica apenas se `'message' in errorBody`. Quando o Exception Filter global do backend (ID10) for plugado no `main.ts`, os erros serão envelopados no formato `{ error: { code, message } }`, onde a mensagem fica em `errorBody.error.message`. Embora o código possua fallbacks seguros (`apiMessage ?? 'E-mail já está em uso.'`), suportar ambos os formatos (`const apiMessage = errorBody?.error?.message ?? errorBody?.message ?? null;`) garante que mensagens específicas vindas do backend no envelope oficial sejam aproveitadas.
- **Guarda de re-submissão imperativa no `onSubmit()`** — `apps/web/src/app/features/auth/register/register.component.ts:74`:
  O botão de submissão já possui o binding `[disabled]="isSubmitting()"`. No entanto, adicionar uma cláusula `if (this.isSubmitting()) return;` no início de `onSubmit()` reforça a proteção contra múltiplos disparos via tecla Enter antes que a detecção de alterações do Angular propague a desabilitação no DOM.
- **Contrato de envelope de sucesso no repositório** — `apps/web/src/app/features/auth/auth.service.ts:25`:
  `register()` tipa o retorno como `Observable<RegisteredUser>`. Quando o `ResponseInterceptor` (ID10) for implementado na API com envelope `{ data: RegisteredUser }`, o serviço poderá ajustar a tipagem ou utilizar `map(res => res.data)` para entregar o modelo limpo para os consumidores.

## Observações fora do escopo deste diff
- **Execução do test runner no Windows / Vitest forks timeout**: Na primeira execução a frio de `npm test -w apps/web` (`ng test`), o tempo de compilação inicial somado à inicialização de workers de fork do Vitest no Windows pode beirar ou exceder o timeout padrão de 60s do runner. Recomenda-se avaliar configuração de pool ou script com `--no-watch` no `package.json` para garantir execução sem atrito tanto no ambiente local quanto no CI (ID18).

