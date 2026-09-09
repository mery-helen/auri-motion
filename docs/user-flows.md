# 🗺️ Jornadas de Usuário

**Projeto:** Auri Motion  
**Versão:** 1.0.0 · jornada inicial via `/utf-flows`  
**Última atualização:** 2026-09-09  

> 🤖 **Este documento é a fonte da verdade sobre O QUE A PESSOA VIVE na tela** —
> o caminho do primeiro clique até o objetivo, e principalmente os pontos onde ela
> trava, espera ou desiste.
>
> 🚫 **Não duplique:** regra de negócio mora no `prd.md`; estado, entidade e contrato
> moram no `architecture.md`. Aqui mora o caminho.

---

## Jornada 1 — Emissão e Confirmação de Cobrança do Atendimento

**Story:** US04 e US05  
**Critérios que ela marca:** Sai do site e volta · Depende do tempo · Depende de outra pessoa agir · Pode ser abandonada no meio  

```mermaid
flowchart TD
    A(["«fisioterapeuta» seleciona o atendimento e clica em Cobrar"]) --> B{"Sessão já possui cobrança paga ou em conflito?"}
    B -->|"sim"| C["Sistema bloqueia duplicidade e avisa o profissional"]
    B -->|"não"| D{"Valor informado é maior que zero?"}
    D -->|"não"| E["Sistema destaca erro no valor"]
    D -->|"sim"| F["Sistema gera a cobrança com status Pendente e o link/QR Code de pagamento"]
    F --> G["«fisioterapeuta» copia e envia o link/instrução ao paciente"]
    G --> H(["«paciente» acessa a tela de checkout externo"])
    
    H --> I{"O que o paciente faz?"}
    I -->|"Fecha a aba ou abandona o checkout"| X1[["Nó Vermelho: Paciente abandona o checkout"]]
    I -->|"Tenta pagar, mas a operadora recusa"| X2[["Nó Vermelho: Cartão recusado / Falha no pagamento"]]
    I -->|"Conclui o pagamento com sucesso"| J["Solução de pagamentos envia confirmação assíncrona"]
    
    J --> K{"Notificação é autêntica e válida?"}
    K -->|"não"| L["Sistema descarta mensagem e registra alerta de segurança"]
    K -->|"sim"| M{"Evento já havia sido processado antes?"}
    M -->|"sim (duplicata)"| N["Ignora idempotentemente sem alterar valores"]
    M -->|"não"| O["Registra Pagamento e atualiza Cobrança para 'Pago'"]
    O --> P(["«fisioterapeuta» visualiza status 'Pago' e quitação no histórico"])

    style X1 fill:#ffe0e0,stroke:#c62828
    style X2 fill:#ffe0e0,stroke:#c62828
```

**O que decidimos sobre os nós vermelhos:**

- **Abandono do checkout (X1):** Caso o paciente feche ou abandone a tela de checkout, a cobrança e o link/QR Code permanecem válidos por uma tolerância de 5 minutos, permitindo que o paciente retorne e conclua o pagamento sem necessidade de uma nova emissão. Expirado esse prazo de 5 minutos sem confirmação de pagamento, o status da cobrança é alterado automaticamente para "Expirado", evitando que registros fiquem pendentes indefinidamente.
- **Cartão recusado / Falha no pagamento (X2):** Em caso de recusa pela operadora de pagamentos, o sistema atualiza o status da cobrança para "Falha no Pagamento" e notifica o fisioterapeuta na tela de detalhes da sessão, permitindo que ele cancele o registro ou reemita uma nova cobrança imediatamente.

---

## Dúvidas em aberto

| # | Dúvida | Onde ela precisa ser resolvida |
| --- | --- | --- |
| 1 | Mecanismo exato de expiração após os 5 minutos (job agendado em background, verificação sob demanda no acesso ou expiração nativa configurada no payload da sessão do gateway) | `/utf-architecture` |
