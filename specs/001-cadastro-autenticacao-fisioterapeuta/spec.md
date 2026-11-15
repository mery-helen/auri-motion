---
issue: 1
status: aprovada   # rascunho | aprovada
---

# US01 — Cadastro e Autenticação do Fisioterapeuta

## O problema

Fisioterapeutas e estudantes de fisioterapia não têm um sistema próprio para gerenciar seus pacientes com segurança. Sem autenticação, qualquer pessoa poderia acessar dados clínicos sensíveis; sem isolamento de conta, dados de pacientes de diferentes profissionais se misturariam. A ausência de um mecanismo de cadastro e login impede que o profissional tenha uma área restrita onde apenas ele acessa e gerencia sua própria carteira de atendimentos.

## A história

**Como** fisioterapeuta ou estudante de fisioterapia, **eu quero** criar minha conta e me autenticar com e-mail e senha, **para que** eu tenha acesso seguro à minha área restrita e mantenha os dados dos meus pacientes isolados de outros profissionais.

## Critérios de aceite

- [ ] **CA1 — Dado** que preencho nome completo, e-mail válido e uma senha forte (mínimo 8 caracteres com ao menos 1 letra maiúscula, 1 número e 1 caractere especial), **quando** submeto o cadastro, **então** a conta é criada com sucesso, a senha nunca é armazenada em texto puro e sou redirecionado para a tela de login para entrar com meu e-mail e senha.
- [ ] **CA2 — Dado** que informo meu e-mail e senha cadastrados corretos, **quando** solicito o login, **então** o sistema autentica meu acesso, abre uma sessão com duração de 1 hora e redireciona para a tela de listagem de pacientes.
- [ ] **CA3 — Dado** que informo e-mail inexistente ou senha incorreta, **quando** submeto as credenciais de login, **então** o sistema recusa o acesso com mensagem genérica "Credenciais inválidas", sem especificar qual dos campos falhou.
- [ ] **CA4 — Dado** que tento me cadastrar com um e-mail já existente no sistema, **quando** envio os dados, **então** o sistema impede a duplicação e retorna erro informando que o e-mail já está em uso (RN02).
- [ ] **CA5 — Dado** que submeto o formulário de cadastro com campos obrigatórios em branco (nome, e-mail ou senha), **quando** o formulário é enviado, **então** o sistema rejeita a requisição e aponta os campos faltantes.
- [ ] **CA6 — Dado** que submeto o cadastro com e-mail em formato inválido ou senha que não atende aos critérios de força, **quando** o formulário é enviado, **então** o sistema rejeita a requisição com mensagem de validação específica para o campo inválido.
- [ ] **CA7 — Dado** que estou com uma sessão ativa e ela expira enquanto uso o app, **quando** o sistema recebe uma resposta de não autorizado do servidor, **então** sou levado automaticamente à tela de login.
- [ ] **CA8 — Dado** que estou com uma sessão ativa e tento acessar as telas de login ou cadastro, **quando** o app verifica minha sessão válida, **então** sou redirecionado automaticamente para a tela de listagem de pacientes.
- [ ] **CA9 — Dado** que não tenho sessão ativa e tento acessar qualquer tela protegida do app, **quando** o app verifica a ausência de sessão, **então** sou redirecionado para a tela de login.
- [ ] **CA10 — Dado** que preencho um cadastro válido e submeto o formulário, **quando** a requisição falha por erro de rede ou timeout, **então** uma mensagem de erro de conectividade é exibida e os campos permanecem preenchidos para nova tentativa.

## Fora de escopo

- Recuperação de senha (fluxo "Esqueci minha senha") — sem e-mail transacional nesta história.
- Bloqueio de conta por múltiplas tentativas de login erradas — não está no PRD.
- Autenticação por redes sociais (Google, Facebook) ou SSO.
- Expiração por inatividade e renovação de sessão (refresh token): nesta história a sessão dura 1 hora fixa a partir do login, mesmo com o uso contínuo. A pessoa precisa entrar de novo ao fim da hora.
- Perfil do fisioterapeuta (editar nome, trocar senha após cadastro) — não está no PRD.
- Logout no servidor (invalidação de token) — token expira naturalmente.
- Verificação de e-mail por link após cadastro.

## Abandono no meio

**Sessão expirada durante o uso (CA7):** Não há nó vermelho no `docs/user-flows.md` para esta história — o fluxo de autenticação é o pré-requisito de todas as demais jornadas. O risco principal é a sessão expirar em 1 hora enquanto o profissional está no meio de um registro clínico. Decisão: ao receber uma resposta de não autorizado do servidor, o app leva o usuário à tela de login; dados de formulários abertos são perdidos (não há persistência local nesta história). O usuário refaz o login e volta ao fluxo. A sessão expira naturalmente — não há chamada de invalidação no servidor.

**Conexão caindo durante o cadastro (CA10):** Se a requisição de cadastro falhar por timeout ou erro de rede, o formulário exibe mensagem de erro de conectividade e permanece preenchido para nova tentativa — sem risco de duplicação, pois o sistema rejeita e-mails já cadastrados (RN02).

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| A tela de listagem de pacientes ainda não existe. CA2 (redirecionamento pós-login) e CA9 (rota protegida de destino) dependem dela; enquanto não existir, ambos usam uma rota provisória — `// TODO #2` no código de redirecionamento. | #2 — US02 |

## Depende de

_(Nenhuma — esta é a primeira história; nenhuma outra precisa estar na `main` antes dela.)_

## Dúvidas em aberto

| # | Dúvida | Quem responde |
| --- | --- | --- |

