// Configuração do site
const CONFIG = {
  // URL da API de pagamentos (com prefixo /api pois o servidor proxy adiciona este caminho)
  API_URL: "https://painel.seletivosbrasil.com/api",

  // Valores das taxas em centavos
  TAXAS: {
    EAM: 5300,        // R$ 53,00 - Taxa Escolas de Aprendizes-Marinheiros
    MEDIO: 9000,      // R$ 90,00
    SUPERIOR: 13000,  // R$ 130,00
  },

  // Descrições dos concursos
  CONCURSOS: {
    EAM: "Taxa de Inscrição - Concurso Marinha EAM 2026",
    MARINHA: "Taxa de Inscrição - Escolas de Aprendizes-Marinheiros 2026",
  },

  // Configuração de polling para verificar status do pagamento
  POLLING: {
    INTERVAL: 5000,     // 5 segundos
    MAX_ATTEMPTS: 120,  // 10 minutos máximo
  }
};

// Exportar para uso global
window.SITE_CONFIG = CONFIG;
