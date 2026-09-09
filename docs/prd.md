# 📄 Product Requirements Document (PRD)

**Projeto:** Auri Motion  
**Versão:** 0.2.0 · ajustado via `/utf-prd`  
**Última atualização:** 2026-09-09  

> 🤖 **Este documento é a fonte da verdade sobre o QUE o produto faz.** Regra de
> negócio que não estiver aqui não existe — nem para a equipe, nem para a IA.
> Tecnologia **não** se discute aqui: isso é assunto do `architecture.md`.

---

## 🎯 1. Visão Geral e Objetivo

**O problema:** Estudantes de fisioterapia e fisioterapeutas enfrentam desorganização no acompanhamento dos seus pacientes, com dados clínicos dispersos (situação atual, comorbidades, condutas de tratamento) e controle manual ou falho de agendamentos e cobranças das sessões.

**A solução:** Um aplicativo intuitivo e fácil de usar para gestão clínica e financeira de atendimentos fisioterapêuticos. O app centraliza o cadastro de pacientes, agenda datas e horários, registra o quadro clínico e a conduta terapêutica a adotar, além de permitir gerar e receber o pagamento das sessões diretamente pelo aplicativo.

**Como saberemos que deu certo:** Um fisioterapeuta consegue cadastrar um paciente com suas comorbidades, agendar e registrar uma sessão com a conduta aplicada, e gerar uma cobrança que tem o pagamento confirmado pelo sistema via processador de pagamentos.

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
| **Pagamento** | A transação financeira processada que liquida uma cobrança em aberto. | A cobrança/fatura ainda pendente de quitação. |

---

## 👤 3. Atores e Permissões

| Ator | Quem é | Pode | Não pode |
| :--- | :----- | :--- | :------- |
| **Fisioterapeuta** | O profissional ou estudante de fisioterapia autenticado no sistema. | Cadastrar-se e autenticar-se; gerenciar sua carteira de pacientes; registrar e atualizar comorbidades e condutas clínicas; agendar atendimentos; gerar cobranças para as sessões; acompanhar o status de pagamento integrado. | Acessar, visualizar, editar ou excluir pacientes, prontuários, agendamentos e cobranças de outro fisioterapeuta (isolamento estrito de dados por usuário); alterar o valor ou dados de uma cobrança já liquidada; confirmar pagamentos manualmente sem retorno de confirmação da solução de pagamentos. |

---

## 📝 4. Escopo Funcional (User Stories)

### US01 — Cadastro e Autenticação do Fisioterapeuta · `Must Have` · `S` · Status: `🟡 Ready`

**Como** fisioterapeuta ou estudante de fisioterapia,  
**eu quero** criar minha conta e me autenticar com e-mail e senha,  
**para que** eu tenha acesso seguro à minha área restrita e mantenha os dados dos meus pacientes isolados de outros profissionais.

**Critérios de aceite:**
- [ ] **Dado** que preencho nome completo, e-mail válido e uma senha forte, **quando** submeto o cadastro, **então** a conta é criada com sucesso e a senha é armazenada de forma segura.
- [ ] **Dado** que informo meu e-mail e senha cadastrados, **quando** solicito o login, **então** o sistema autentica meu acesso e libera a sessão.
- [ ] **Dado** que tento realizar login com e-mail inexistente ou senha incorreta, **quando** submeto as credenciais, **então** o sistema recusa o acesso informando credenciais inválidas, sem especificar qual dos campos falhou.
- [ ] **Dado** que tento me cadastrar utilizando um e-mail já existente no sistema, **quando** envio os dados, **então** o sistema impede a duplicação e informa que o e-mail já está em uso.

**Regras relacionadas:** RN01, RN02

---

### US02 — Cadastro e Gestão de Pacientes com Comorbidades · `Must Have` · `M` · Status: `🟡 Ready`

**Como** fisioterapeuta autenticado,  
**eu quero** cadastrar, listar, visualizar e atualizar pacientes com seus dados pessoais e histórico de comorbidades,  
**para que** eu mantenha um registro clínico centralizado e organizado de cada pessoa sob meus cuidados.

**Critérios de aceite:**
- [ ] **Dado** que estou autenticado e informo nome completo, CPF, contato, data de nascimento e lista de comorbidades, **quando** salvo o cadastro, **então** o paciente é registrado com sucesso e vinculado exclusivamente à minha conta.
- [ ] **Dado** que possuo pacientes cadastrados, **quando** consulto a listagem de pacientes, **então** o sistema exibe apenas os pacientes que pertencem a mim, com opção de busca por nome.
- [ ] **Dado** que ainda não cadastrei nenhum paciente, **quando** consulto a listagem, **então** o sistema exibe um estado vazio (*empty state*) informando que nenhum paciente foi encontrado e sugerindo o primeiro cadastro.
- [ ] **Dado** que tento cadastrar um paciente com campos obrigatórios em branco (ex.: sem nome ou CPF), **quando** submeto o formulário, **então** o sistema rejeita o cadastro e aponta os erros de preenchimento.
- [ ] **Dado** que tento consultar, editar ou inativar um paciente que pertence a outro fisioterapeuta, **quando** realizo a ação, **então** o sistema nega o acesso e protege a privacidade dos dados.

**Regras relacionadas:** RN01, RN03, RN09, RN12

---

### US03 — Agendamento e Registro de Atendimento com Conduta Terapêutica · `Must Have` · `M` · Status: `🟡 Ready`

**Como** fisioterapeuta autenticado,  
**eu quero** agendar sessões para meus pacientes e registrar a conduta clínica e terapêutica aplicada em cada uma,  
**para que** eu acompanhe a evolução do tratamento e tenha um histórico claro dos procedimentos realizados.

**Critérios de aceite:**
- [ ] **Dado** que seleciono um paciente de minha carteira e informo data, horário e valor previsto, **quando** salvo o agendamento, **então** a sessão é criada vinculada àquele paciente com status inicial "Agendado".
- [ ] **Dado** que um atendimento foi realizado, **quando** preencho a evolução do paciente e a conduta terapêutica adotada (exercícios, manobras, técnicas aplicadas), **então** o atendimento é salvo com status "Realizado" e fica registrado no histórico do paciente.
- [ ] **Dado** que consulto o perfil de um paciente, **quando** abro a aba de atendimentos, **então** vejo a lista de todas as suas sessões em ordem cronológica (da mais recente para a mais antiga).
- [ ] **Dado** que tento agendar uma sessão com horário em conflito com outro agendamento já existente na minha agenda, **quando** tento salvar, **então** o sistema avisa o conflito e impede a sobreposição de horários.
- [ ] **Dado** que tento vincular um atendimento a um paciente pertencente a outro fisioterapeuta, **quando** envio a solicitação, **então** o sistema rejeita a operação com erro de autorização.

**Regras relacionadas:** RN01, RN03, RN04, RN10

---

### US04 — Emissão de Cobrança de Atendimento (Pedido) · `Must Have` · `M` · Status: `🟡 Ready`

**Como** fisioterapeuta autenticado,  
**eu quero** gerar uma cobrança vinculada a uma sessão de atendimento com integração à solução de pagamentos,  
**para que** o paciente receba o link/meio de pagamento e eu possa controlar financeiramente meus atendimentos.

**Critérios de aceite:**
- [ ] **Dado** que seleciono uma sessão realizada ou agendada e informo o valor da cobrança, **quando** solicito a emissão, **então** o sistema cria o registro de Cobrança com status "Pendente", comunica-se com a solução de pagamentos e gera o link/instrução de pagamento.
- [ ] **Dado** uma cobrança gerada com sucesso, **quando** acesso os detalhes da sessão, **então** consigo visualizar o link de pagamento gerado para enviar ao paciente e o status atual da cobrança ("Pendente").
- [ ] **Dado** que tento gerar uma cobrança com valor zerado ou negativo, **quando** envio a solicitação, **então** o sistema impede a emissão informando que o valor deve ser maior que zero.
- [ ] **Dado** que uma sessão já possui uma cobrança quitada com status "Pago", **quando** tento emitir uma nova cobrança para ela, **então** o sistema bloqueia a duplicidade informando que a sessão já foi paga.
- [ ] **Dado** que ocorra uma indisponibilidade na solução de pagamentos durante a geração, **quando** a operação falha, **então** o sistema não registra a cobrança como emitida e exibe mensagem amigável informando a impossibilidade momentânea.

**Regras relacionadas:** RN01, RN05, RN06

---

### US05 — Confirmação Automática de Pagamento · `Must Have` · `M` · Status: `🟡 Ready`

**Como** fisioterapeuta autenticado,  
**eu quero** que o sistema receba e processe automaticamente as confirmações de pagamento enviadas pela solução de pagamentos,  
**para que** o status da cobrança seja atualizado em tempo real para "Pago" ou "Falhou", sem necessidade de controle manual.

**Critérios de aceite:**
- [ ] **Dado** que a solução de pagamentos envia uma notificação confirmando a aprovação do pagamento, **quando** o sistema valida e processa a mensagem, **então** o registro de Pagamento é criado (com data e método) e a Cobrança passa para o status "Pago".
- [ ] **Dado** que o fisioterapeuta acessa a listagem ou detalhes da sessão, **quando** a cobrança foi confirmada automaticamente, **então** ele visualiza o status "Pago" e a data da quitação.
- [ ] **Dado** que uma notificação chegue com origem duvidosa ou sem validação de autenticidade, **quando** o sistema recebe a mensagem, **então** ele rejeita a alteração, mantém a cobrança como pendente e registra o alerta.
- [ ] **Dado** que a solução de pagamentos reenvie a confirmação de um pagamento já processado anteriormente, **quando** a mensagem é recebida, **então** o sistema ignora a duplicidade mantendo o status "Pago" sem duplicar lançamentos.
- [ ] **Dado** que a solução de pagamentos notifique a recusa ou expiração do pagamento, **quando** a mensagem é processada, **então** a cobrança é atualizada para "Falhou" ou "Expirado", permitindo gerar uma nova cobrança.

**Regras relacionadas:** RN06, RN07, RN08, RN11

---

## 🛡️ 5. Regras de Negócio (Constraints)

| ID | Regra | Stories Relacionadas |
| :--- | :--- | :--- |
| **RN01** | **Isolamento de Dados por Usuário:** Todo paciente, sessão e cobrança pertencem exclusivamente ao fisioterapeuta que o cadastrou. Nenhum usuário pode visualizar ou modificar dados de terceiros. | US01, US02, US03, US04 |
| **RN02** | **Unicidade de Identificação:** Não é permitido criar mais de uma conta de fisioterapeuta com o mesmo endereço de e-mail. | US01 |
| **RN03** | **Vínculo Clínico Obrigatório:** Uma conduta terapêutica e um atendimento só podem existir vinculados a um paciente cadastrado; não existem registros clínicos órfãos. | US02, US03 |
| **RN04** | **Bloqueio de Conflito de Agenda:** Não é permitido agendar sessões com horários concorrentes ou sobrepostos para o mesmo fisioterapeuta. | US03 |
| **RN05** | **Valor Mínimo da Cobrança:** Toda cobrança gerada deve ter valor monetário estritamente maior que zero. | US04 |
| **RN06** | **Imutabilidade de Cobrança Liquidada:** Uma vez que uma cobrança atinge o status "Pago", ela não pode ser alterada, recalculada ou reemitida para a mesma sessão. | US04, US05 |
| **RN07** | **Validação da Origem do Pagamento:** Notificações de pagamento só alteram o status da cobrança se a autenticidade da origem da solução de pagamentos for confirmada. Mensagens não autenticadas são descartadas. | US05 |
| **RN08** | **Processamento Único de Pagamento:** Notificações repetidas relativas a um mesmo evento de pagamento devem ser processadas apenas uma vez, impedindo duplicidade de recebimentos ou alteração de valores. | US05 |
| **RN09** | **Proteção do Histórico (Inativação de Pacientes):** Pacientes com histórico de atendimentos ou cobranças não podem ser excluídos do sistema, apenas inativados, preservando o histórico clínico e financeiro. | US02 |
| **RN10** | **Gestão de Cancelamento de Sessão:** Cancelamentos de atendimentos liberam o horário na agenda do fisioterapeuta e marcam a sessão como "Cancelada", impedindo a emissão de novas cobranças para aquele agendamento. | US03 |
| **RN11** | **Registro de Estornos:** Caso uma cobrança já paga precise ser devolvida ao paciente, o evento deve ser registrado como um lançamento de estorno/reembolso vinculado, mantendo a cobrança original imutável. | US05 |
| **RN12** | **Unicidade de Paciente por Fisioterapeuta:** Não é permitido cadastrar dois pacientes com o mesmo CPF na carteira de um mesmo fisioterapeuta. | US02 |

---

## 🚫 6. Fora de Escopo (Non-goals)

- **Emissão de Nota Fiscal Eletrônica (NF-e):** O sistema não emitirá notas fiscais de serviço junto a prefeituras ou órgãos governamentais.
- **Gestão de Convênios e Planos de Saúde:** O aplicativo é focado exclusivamente no atendimento particular direto.
- **Prescrição e Venda de Medicamentos:** O sistema é focado estritamente na prática e conduta fisioterapêutica, não englobando módulo farmacológico.
- **Portal de Acesso do Paciente:** O paciente não possui login ou acesso ao aplicativo; ele apenas recebe o link de pagamento.
- **Chat ou Mensagens em Tempo Real:** O aplicativo não terá sistema interno de troca de mensagens instantâneas entre profissional e paciente.

---

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)

- **Privacidade e Conformidade:** Todos os dados de pacientes e registros de conduta clínica devem seguir diretrizes rígidas de confidencialidade e proteção de dados pessoais (LGPD).
- **Usabilidade Mobile-First:** A interface deve ser otimizada para uso ágil em smartphones e tablets, permitindo registros rápidos no intervalo entre atendimentos.
- **Disponibilidade:** O sistema deve estar disponível para consulta da agenda e registros clínicos durante o horário de funcionamento dos atendimentos.
- **Desempenho de Navegação:** A busca por pacientes e a consulta ao histórico de sessões devem carregar de forma instantânea para não travar a rotina do profissional.

---

## 🛠️ 8. Histórico

| Data | Versão | O que mudou |
| :--- | :----- | :---------- |
| 2026-09-09 | 0.1.0 | Rascunho inicial via `/utf-prd` |
| 2026-09-09 | 0.2.0 | Ajuste de vocabulário de negócio (remoção de termos de arquitetura/tecnologia), promoção das User Stories para `🟡 Ready`, adição das Regras de Negócio (RN01 a RN12), Fora de Escopo e Requisitos Não Funcionais |
