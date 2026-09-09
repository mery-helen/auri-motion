# 📄 Product Requirements Document (PRD)

**Projeto:** Auri Motion  
**Versão:** 0.1.0 · rascunho via `/utf-prd`  
**Última atualização:** 2026-09-09  

> 🤖 **Este documento é a fonte da verdade sobre o QUE o produto faz.** Regra de
> negócio que não estiver aqui não existe — nem para a equipe, nem para a IA.
> Tecnologia **não** se discute aqui: isso é assunto do `architecture.md`.

---

## 🎯 1. Visão Geral e Objetivo

**O problema:** Estudantes de fisioterapia e fisioterapeutas enfrentam desorganização no acompanhamento dos seus pacientes, com dados clínicos dispersos (situação atual, comorbidades, condutas de tratamento) e controle manual ou falho de agendamentos e cobranças das sessões.

**A solução:** Um aplicativo intuitivo e fácil de usar para gestão clínica e financeira de atendimentos fisioterapêuticos. O app centraliza o cadastro de pacientes, agenda datas e horários, registra o quadro clínico e a conduta terapêutica a adotar, além de permitir gerar e receber o pagamento das sessões diretamente pelo aplicativo.

**Como saberemos que deu certo:** Um fisioterapeuta consegue cadastrar um paciente com suas comorbidades, agendar e registrar uma sessão com a conduta aplicada, e gerar uma cobrança que tem o pagamento confirmado pelo sistema via gateway.

---

## 📖 2. Glossário Ubíquo

| Termo | Significa | Não confundir com |
| :---- | :-------- | :---------------- |
| **Fisioterapeuta** | O profissional ou estudante de fisioterapia que utiliza o app para gerenciar seus pacientes, agendas e atendimentos. | O paciente atendido ou administrador da plataforma. |
| **Paciente** | A pessoa que recebe a assistência fisioterapêutica e a quem as cobranças são destinadas (dado cadastrado, sem login no sistema). | Usuário com acesso às funcionalidades de gestão clínica. |
| **Comorbidade** | Doença ou condição clínica pré-existente do paciente (ex.: diabetes, hipertensão) relevante para a conduta e o tratamento. | Queixa principal ou diagnóstico cinesiológico da sessão. |
| **Conduta Terapêutica** | As técnicas, manobras, exercícios e procedimentos clínicos prescritos e aplicados ao paciente durante a sessão. | Evolução diária genérica ou prescrição médica de medicamentos. |
| **Atendimento (Sessão)** | O encontro com data, horário e registro clínico onde o fisioterapeuta aplica a conduta no paciente. | O tratamento global/plano completo ou consulta médica. |
| **Cobrança (Pedido)** | A emissão da ordem de pagamento a ser quitada pelo paciente referente a uma ou mais sessões de atendimento. | O pagamento efetivamente liquidado e confirmado. |
| **Pagamento** | A transação financeira processada pelo gateway que liquida uma cobrança em aberto. | A cobrança/fatura ainda pendente de quitação. |

---

## 👤 3. Atores e Permissões

| Ator | Quem é | Pode | Não pode |
| :--- | :----- | :--- | :------- |
| **Fisioterapeuta** | O profissional ou estudante de fisioterapia autenticado no sistema. | Cadastrar-se e autenticar-se; gerenciar sua carteira de pacientes; registrar e atualizar comorbidades e condutas clínicas; agendar atendimentos; gerar cobranças para as sessões; acompanhar o status de pagamento integrado ao gateway. | Acessar, visualizar, editar ou excluir pacientes, prontuários, agendamentos e cobranças de outro fisioterapeuta (isolamento estrito de dados por usuário); alterar o valor ou dados de uma cobrança já liquidada; confirmar pagamentos manualmente sem retorno do webhook do gateway. |

---

## 📝 4. Escopo Funcional (User Stories)

### US01 — Cadastro e Autenticação do Fisioterapeuta · `Must Have` · `S` · Status: `⚪ Draft`

**Como** fisioterapeuta ou estudante de fisioterapia,  
**eu quero** criar minha conta e me autenticar com e-mail e senha,  
**para que** eu tenha acesso seguro à minha área restrita e mantenha os dados dos meus pacientes isolados de outros profissionais.

**Critérios de aceite:**
- [ ] **Dado** que preencho nome completo, e-mail válido e uma senha forte, **quando** submeto o cadastro, **então** a conta é criada com sucesso e a senha é armazenada de forma segura.
- [ ] **Dado** que informo meu e-mail e senha cadastrados, **quando** solicito o login, **então** o sistema autentica meu acesso e libera a sessão.
- [ ] **Dado** que tento realizar login com e-mail inexistente ou senha incorreta, **quando** submeto as credenciais, **então** o sistema recusa o acesso informando credenciais inválidas, sem especificar qual dos campos falhou.
- [ ] **Dado** que tento me cadastrar utilizando um e-mail já existente na base, **quando** envio os dados, **então** o sistema impede a duplicação e informa que o e-mail já está em uso.

**Regras relacionadas:** RN01, RN02

---

### US02 — Cadastro e Gestão de Pacientes com Comorbidades · `Must Have` · `M` · Status: `⚪ Draft`

**Como** fisioterapeuta autenticado,  
**eu quero** cadastrar, listar, visualizar e atualizar pacientes com seus dados pessoais e histórico de comorbidades,  
**para que** eu mantenha um registro clínico centralizado e organizado de cada pessoa sob meus cuidados.

**Critérios de aceite:**
- [ ] **Dado** que estou autenticado e informo nome completo, contato, data de nascimento e lista de comorbidades (ou histórico de queixas prévias), **quando** salvo o cadastro, **então** o paciente é registrado com sucesso e vinculado exclusivamente à minha conta.
- [ ] **Dado** que possuo pacientes cadastrados, **quando** consulto a listagem de pacientes, **então** o sistema exibe apenas os pacientes que pertencem a mim, com opção de busca por nome.
- [ ] **Dado** que ainda não cadastrei nenhum paciente, **quando** consulto a listagem, **então** o sistema exibe um estado vazio (*empty state*) informando que nenhum paciente foi encontrado e sugerindo o primeiro cadastro.
- [ ] **Dado** que tento cadastrar um paciente com campos obrigatórios em branco (ex.: sem nome), **quando** submeto o formulário, **então** o sistema rejeita o cadastro e aponta os erros de preenchimento.
- [ ] **Dado** que tento consultar, editar ou excluir um paciente que pertence a outro fisioterapeuta, **quando** realizo a requisição, **então** o sistema nega o acesso e protege a privacidade dos dados.

**Regras relacionadas:** RN01, RN03

---

### US03 — Agendamento e Registro de Atendimento com Conduta Terapêutica · `Must Have` · `M` · Status: `⚪ Draft`

**Como** fisioterapeuta autenticado,  
**eu quero** agendar sessões para meus pacientes e registrar a conduta clínica e terapêutica aplicada em cada uma,  
**para que** eu acompanhe a evolução do tratamento e tenha um histórico claro dos procedimentos realizados.

**Critérios de aceite:**
- [ ] **Dado** que seleciono um paciente de minha carteira e informo data, horário e valor previsto, **quando** salvo o agendamento, **então** a sessão é criada vinculada àquele paciente com status inicial "Agendado".
- [ ] **Dado** que um atendimento foi realizado, **quando** preencho a evolução do paciente e a conduta terapêutica adotada (exercícios, manobras, técnicas aplicadas), **então** o atendimento é salvo com status "Realizado" e fica registrado no prontuário do paciente.
- [ ] **Dado** que consulto o perfil de um paciente, **quando** abro a aba de atendimentos, **então** vejo a lista de todas as suas sessões em ordem cronológica (da mais recente para a mais antiga).
- [ ] **Dado** que tento agendar uma sessão com horário em conflito com outro agendamento já existente na minha agenda, **quando** tento salvar, **então** o sistema avisa o conflito e impede a sobreposição de horários.
- [ ] **Dado** que tento vincular um atendimento a um paciente pertencente a outro fisioterapeuta, **quando** envio a requisição, **então** o sistema rejeita a operação com erro de autorização.

**Regras relacionadas:** RN01, RN03, RN04

---

### US04 — Emissão de Cobrança de Atendimento (Pedido) · `Must Have` · `M` · Status: `⚪ Draft`

**Como** fisioterapeuta autenticado,  
**eu quero** gerar uma cobrança vinculada a uma sessão de atendimento com integração ao gateway de pagamento (Stripe ou Mercado Pago em modo sandbox),  
**para que** o paciente receba o link/meio de pagamento e eu possa controlar financeiramente meus atendimentos.

**Critérios de aceite:**
- [ ] **Dado** que seleciono uma sessão realizada ou agendada e informo o valor da cobrança, **quando** solicito a emissão, **então** o sistema cria o registro de Cobrança com status "Pendente", comunica-se com o gateway em modo de testes (sandbox) e gera a URL de checkout / identificador de pagamento.
- [ ] **Dado** uma cobrança gerada com sucesso, **quando** acesso os detalhes da sessão, **então** consigo visualizar o link de pagamento gerado para enviar ao paciente e o status atual da cobrança ("Pendente").
- [ ] **Dado** que tento gerar uma cobrança com valor zerado ou negativo, **quando** envio a solicitação, **então** o sistema impede a emissão informando que o valor deve ser maior que zero.
- [ ] **Dado** que uma sessão já possui uma cobrança quitada com status "Pago", **quando** tento emitir uma nova cobrança para ela, **então** o sistema bloqueia a duplicidade informando que a sessão já foi paga.
- [ ] **Dado** que ocorra uma falha de comunicação ou timeout com o gateway sandbox durante a geração, **quando** a operação falha, **então** o sistema não registra a cobrança como emitida e exibe mensagem de erro amigável ao usuário.

**Regras relacionadas:** RN01, RN05, RN06

---

### US05 — Confirmação de Pagamento via Webhook · `Must Have` · `M` · Status: `⚪ Draft`

**Como** fisioterapeuta autenticado,  
**eu quero** que o sistema receba e processe automaticamente as notificações assíncronas (webhooks) do gateway de pagamento,  
**para que** o status da cobrança seja atualizado em tempo real para "Pago" ou "Falhou", sem que eu precise conferir extratos bancários manualmente.

**Critérios de aceite:**
- [ ] **Dado** que o gateway envia uma notificação de evento com assinatura válida informando aprovação de pagamento (`payment_intent.succeeded` ou similar), **quando** o endpoint de webhook processa a mensagem, **então** o sistema registra a entidade de Pagamento (com data, método e ID da transação) e altera o status da Cobrança para "Pago".
- [ ] **Dado** que o fisioterapeuta acessa a listagem ou detalhes da sessão, **quando** a cobrança foi confirmada pelo webhook, **então** ele visualiza o selo de status "Pago" e a data da quitação.
- [ ] **Dado** que uma notificação chega com assinatura criptográfica inválida ou corpo adulterado, **quando** o endpoint de webhook recebe a requisição, **então** o sistema rejeita imediatamente o pacote (HTTP 400/401), não altera o status e registra o alerta de segurança.
- [ ] **Dado** que o gateway reenvia a mesma notificação de um pagamento já processado (duplicação de webhook), **quando** a requisição é recebida, **então** o sistema atua de forma idempotente, mantendo o status "Pago" sem criar registros duplicados de quitação.
- [ ] **Dado** que o webhook notifica recusa ou expiração do pagamento (`payment_intent.payment_failed`), **quando** a mensagem é processada, **então** a cobrança é atualizada para "Falhou" ou "Expirado", permitindo ao fisioterapeuta gerar nova cobrança se desejar.

**Regras relacionadas:** RN06, RN07, RN08

---

## 🛡️ 5. Regras de Negócio (Constraints)

<!-- Em análise e validação pelo aluno -->

---

## 🚫 6. Fora de Escopo (Non-goals)

<!-- Em definição -->

---

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)

<!-- Em definição -->

---

## 🛠️ 8. Histórico

| Data | Versão | O que mudou |
| :--- | :----- | :---------- |
| 2026-09-09 | 0.1.0 | Rascunho inicial com Visão Geral, Glossário, Ator único e User Stories (US01 a US05) via `/utf-prd` |
