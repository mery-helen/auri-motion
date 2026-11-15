# Decisões — Tarefa 6, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | `jwtInterceptor` nunca anexa o token à requisição — só trata o 401; deve clonar a requisição com `Authorization: Bearer <token>` quando houver token no `TokenStore` e não anexar nada quando não houver, com teste (RED) cobrindo os dois casos | código (bloqueante) | aceito | — |

As demais sugestões do parecer de código (2 a 5) não serão tratadas nesta tarefa.