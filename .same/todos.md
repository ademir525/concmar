# Projeto CONCMAR - Concursos da Marinha do Brasil

## Tarefas Concluídas
- [x] Clonar repositório do GitHub
- [x] Explorar estrutura do projeto
- [x] Configurar servidor de desenvolvimento
- [x] Criar versão inicial
- [x] Implementar captura de UTMs no frontend
- [x] Atualizar página de pagamento para enviar UTMs
- [x] Atualizar backend para receber e armazenar UTMs
- [x] Implementar envio de conversões para UTMify

## Implementação UTM Tracker

### Frontend (`inicio/js/utm-tracker.js`)
- Captura parâmetros UTM da URL ao carregar qualquer página
- Armazena no localStorage com prefixo `utmify_`
- Parâmetros capturados:
  - `utm_source`, `utm_campaign`, `utm_medium`, `utm_term`, `utm_content`
  - `gclid` (Google Ads), `fbclid` (Facebook), `msclkid` (Microsoft), `ttclid` (TikTok)
  - `ref`, `src`
- Também salva `landing_page` e `referrer`

### Páginas com UTM Tracker
- `index.html` (landing page principal)
- `inicio/inscricao/index.html`
- `inicio/validar-dados/index.html`
- `inicio/info/index.html`
- `inicio/endereco/index.html`
- `inicio/questionario/index.html`
- `inicio/local-prova/index.html`
- `inicio/pagamento/index.html`
- `inicio/confirmacao/index.html`

### Backend (`api/src/index.ts`)
- Recebe UTMs na rota `/pix/generate`
- Salva UTMs na tabela `pagamentos_pix`
- Quando pagamento é aprovado (webhook), envia para UTMify

### Configuração UTMify
1. Adicionar no `.env`:
   ```
   UTMIFY_WEBHOOK_URL=https://api.utmify.com.br/webhook/seu-token
   ```
2. Executar migração do banco de dados (se necessário)

## Estrutura do Projeto
- Site estático HTML/CSS/JS
- API backend com Hono/Bun (pasta `api/`)
- Páginas de inscrição em `inicio/`
- Imagens e assets em `images/` e `inicio/images/`

## Notas
- O projeto é um portal de inscrição para concursos da Marinha do Brasil 2026
- Utiliza fontes Rawline e Font Awesome
- Possui integração com PIX para pagamento de taxas (Mangofy)
- Integração UTMify para rastreamento de conversões
