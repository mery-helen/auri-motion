# 🎨 Tokens de Design

**Projeto:** Auri Motion  
**Versão:** 1.0.0 · tokens definidos via `/utf-design`  
**Última atualização:** 2026-09-09  

> 🤖 **Este documento existe para a IA parar de inventar um botão diferente a cada
> tela.** Não é um design system — é o mínimo que dá à prototipagem assistida algo a
> que obedecer.

---

## 1. Paleta de Cores Semântica

Nome semântico que descreve o papel da cor na interface:

| Token Semântico | Valor (Hex) | Papel / Onde se usa |
| :--- | :--- | :--- |
| `superficie-cabecalho` | `#1F4B3E` | Fundo do topo/header da aplicação |
| `acao-primaria` | `#2E9C7C` | Botões de ação principal, CTAs e links |
| `destaque-suave` | `#7ED9B7` | Badges de status, tags e destaques |
| `fundo-aplicacao` | `#F8FAFC` | Fundo geral da tela |
| `superficie-card` | `#FFFFFF` | Fundo dos cards de pacientes e agendamentos |
| `texto-principal` | `#0F2922` | Texto primário de alta legibilidade |
| `texto-suave` | `#52605C` | Subtítulos, datas e descrições secundárias |
| `texto-sobre-escuro` | `#FFFFFF` | Textos e ícones sobre o cabeçalho escuro |
| `sucesso` | `#2E9C7C` | Pagamentos aprovados e atendimentos concluídos |
| `alerta` | `#D97706` | Lembretes e cobranças pendentes |
| `perigo` | `#DC2626` | Ações destrutivas, cancelamentos e pagamentos recusados |
| `desabilitado` | `#E2E8F0` | Fundo de elementos e controles inativos |
| `texto-desabilitado` | `#94A3B8` | Texto de elementos e botões inativos |

---

## 2. Escala de Espaçamento

Uma progressão única usada em toda a aplicação (base 4/8px):

| Token | Medida | Onde se usa |
| :--- | :--- | :--- |
| `xs` | `4px` | Espaçamento micro (distância entre ícone e rótulo, padding interno de badges) |
| `sm` | `8px` | Espaçamento compacto (gap entre campos agrupados, espaçamento entre tags) |
| `md` | `16px` | Espaçamento padrão (padding interno de cards, gap de listas de pacientes) |
| `lg` | `24px` | Espaçamento de separação (margem entre blocos do prontuário ou seções da tela) |
| `xl` | `32px` | Espaçamento amplo (margem externa da página, respiro do cabeçalho) |
| `2xl` | `48px` | Espaçamento de destaque (espaçamento para telas maiores / desktop) |

---

## 3. Tipografia

**Família de Fontes:** `Plus Jakarta Sans`, sans-serif (utilizada em toda a interface).

| Token Semântico | Tamanho · Peso | Papel / Onde se usa |
| :--- | :--- | :--- |
| `display` | 32px · Bold (700) | Nome do app no cabeçalho e destaques de telas |
| `h1` | 24px · SemiBold (600) | Títulos principais de páginas e nomes de pacientes |
| `h2` | 20px · SemiBold (600) | Subtítulos de seções (ex.: "Conduta Terapêutica", "Cobrança") |
| `body` | 16px · Regular (400) | Descrições do prontuário, histórico e textos de leitura |
| `small` | 14px · Medium (500) | Rótulos de formulários, botões, horários e tags de comorbidades |
| `caption` | 12px · Regular (400) | Status de cobrança, datas secundárias e avisos auxiliares |

---

## 4. Estados de Botão

Comportamento do botão de ação primária:

| Estado | Aparência / Comportamento | Papel / Por que existe |
| :--- | :--- | :--- |
| **Normal** | Fundo `acao-primaria` (`#2E9C7C`), texto `texto-sobre-escuro` (`#FFFFFF`), cantos arredondados (8px), tipografia `small` (500) | Aparência padrão em repouso |
| **Hover** | Fundo escurecido para `#247D63`, cursor tipo ponteiro | Feedback visual de clique iminente ao passar o cursor |
| **Foco (Teclado)** | Anel externo nítido de 2px na cor `superficie-cabecalho` (`#1F4B3E`) com respiro de 2px | Acessibilidade para navegação via teclado (`Tab`) |
| **Desabilitado** | Fundo `desabilitado` (`#E2E8F0`), texto `texto-desabilitado` (`#94A3B8`), cursor `not-allowed` | Bloqueio de submissão com dados inválidos ou pendentes |
| **Carregando** | Fundo `acao-primaria` com opacidade 75%, spinner animado de progresso | Proteção contra cliques duplos que geram duplicidade de requisições |

---

## 5. Protótipo

**Link:** `[Pendente]` — a ser incluído pelo aluno  
**Telas previstas:** 3 a 5 telas das jornadas principais (Agenda/Atendimentos, Prontuário com Conduta Terapêutica e Cobrança/Pagamento)
