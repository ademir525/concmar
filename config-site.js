// Configuração do site
const CONFIG = {
  // ========================================
  // LINKS DE PAGAMENTO ESTÁTICOS
  // ========================================
  // Links de pagamento por concurso (redirecionamento direto)
  PAYMENT_LINKS: {
    "cfn": "https://pay.seletivobras.org/4KovG1AvNnVGyDE",           // Fuzileiros Navais
    "oficiais": "https://pay.seletivobras.org/xQBPZvl5m5ygmVq",      // Oficiais da Marinha
    "sargento-musico": "https://pay.seletivobras.org/mwK436eOKOwgQ8b" // Sargento Músico
  },

  // URL da API de pagamentos (mantido para compatibilidade, mas não utilizado)
  // API_URL: "https://painel.seletivosbrasil.com/api",

  // Valores das taxas em centavos (para referência)
  TAXAS: {
    CFN: 4000,          // R$ 40,00 - Fuzileiros Navais
    OFICIAIS: 15000,    // R$ 150,00 - Oficiais da Marinha
    SARGENTO: 9500,     // R$ 95,00 - Sargento Músico
  },

  // Descrições dos concursos
  CONCURSOS: {
    CFN: "Taxa de Inscrição - Soldado Fuzileiro Naval (CFN)",
    OFICIAIS: "Taxa de Inscrição - Oficiais da Marinha (Nível Superior)",
    SARGENTO_MUSICO: "Taxa de Inscrição - Sargento Músico Fuzileiro Naval",
  },

  // ========================================
  // GOOGLE ADS - CONVERSÃO DE VENDAS
  // ========================================
  // Preencha com os dados da sua conta Google Ads
  // Encontre em: Google Ads > Ferramentas > Conversões > Criar ação de conversão
  GOOGLE_ADS: {
    // ID da conta Google Ads (formato: AW-XXXXXXXXXX)
    CONVERSION_ID: "AW-XXXXXXXXXX",

    // Label da conversão de venda/compra (formato: XXXXXXXXXXXXXXXXXXX)
    CONVERSION_LABEL: "XXXXXXXXXXXXXXXXXXX",

    // Habilitar tracking (true para ativar)
    ENABLED: false,

    // Nome do evento de conversão (para debug)
    EVENT_NAME: "purchase_concmar",
  },

  // ========================================
  // META/FACEBOOK ADS - CONVERSÃO (opcional)
  // ========================================
  META_ADS: {
    PIXEL_ID: "",
    ENABLED: false,
  },

  // Identificador único do site (para logs e debug)
  SITE_ID: "concmar",
};

// Exportar para uso global
window.SITE_CONFIG = CONFIG;

// ========================================
// FUNÇÃO PARA OBTER LINK DE PAGAMENTO
// ========================================

/**
 * Obtém o link de pagamento estático para um concurso específico
 * @param {string} concursoId - ID do concurso (cfn, oficiais, sargento-musico)
 * @returns {string|null} - URL do link de pagamento ou null se não encontrado
 */
window.getPaymentLink = function(concursoId) {
  const links = window.SITE_CONFIG?.PAYMENT_LINKS;

  if (!links) {
    console.error("❌ [Payment] Links de pagamento não configurados");
    return null;
  }

  const link = links[concursoId];

  if (!link) {
    console.error(`❌ [Payment] Link não encontrado para concurso: ${concursoId}`);
    return null;
  }

  console.log(`✅ [Payment] Link obtido para ${concursoId}: ${link}`);
  return link;
};

// ========================================
// FUNÇÕES DE TRACKING DE CONVERSÃO
// ========================================

/**
 * Dispara evento de conversão do Google Ads
 * @param {number} value - Valor da conversão em reais (ex: 53.00)
 * @param {string} transactionId - ID único da transação (paymentCode)
 * @param {string} currency - Moeda (padrão: BRL)
 */
window.trackGoogleAdsConversion = function(value, transactionId, currency = "BRL") {
  const config = window.SITE_CONFIG?.GOOGLE_ADS;

  if (!config?.ENABLED) {
    console.log("📊 [Google Ads] Tracking desabilitado");
    return false;
  }

  if (!config.CONVERSION_ID || config.CONVERSION_ID === "AW-XXXXXXXXXX") {
    console.warn("⚠️ [Google Ads] CONVERSION_ID não configurado!");
    return false;
  }

  if (!config.CONVERSION_LABEL || config.CONVERSION_LABEL === "XXXXXXXXXXXXXXXXXXX") {
    console.warn("⚠️ [Google Ads] CONVERSION_LABEL não configurado!");
    return false;
  }

  // Verificar se gtag está disponível
  if (typeof gtag !== "function") {
    console.error("❌ [Google Ads] gtag não encontrado. Verifique se o script do Google Ads está carregado.");
    return false;
  }

  try {
    // Disparar evento de conversão
    gtag("event", "conversion", {
      send_to: `${config.CONVERSION_ID}/${config.CONVERSION_LABEL}`,
      value: value,
      currency: currency,
      transaction_id: transactionId,
    });

    console.log(`✅ [Google Ads] Conversão disparada com sucesso!`, {
      site: window.SITE_CONFIG?.SITE_ID,
      event: config.EVENT_NAME,
      value: value,
      currency: currency,
      transactionId: transactionId,
      conversionId: config.CONVERSION_ID,
    });

    return true;
  } catch (error) {
    console.error("❌ [Google Ads] Erro ao disparar conversão:", error);
    return false;
  }
};

/**
 * Dispara evento de conversão do Meta/Facebook Ads
 * @param {number} value - Valor da conversão em reais
 * @param {string} transactionId - ID único da transação
 */
window.trackMetaAdsConversion = function(value, transactionId) {
  const config = window.SITE_CONFIG?.META_ADS;

  if (!config?.ENABLED || !config?.PIXEL_ID) {
    return false;
  }

  if (typeof fbq !== "function") {
    console.error("❌ [Meta Ads] fbq não encontrado.");
    return false;
  }

  try {
    fbq("track", "Purchase", {
      value: value,
      currency: "BRL",
      content_type: "product",
      content_ids: [transactionId],
    });

    console.log("✅ [Meta Ads] Conversão disparada!", { value, transactionId });
    return true;
  } catch (error) {
    console.error("❌ [Meta Ads] Erro:", error);
    return false;
  }
};

/**
 * Dispara todas as conversões configuradas
 * @param {number} value - Valor da conversão em reais
 * @param {string} transactionId - ID único da transação
 */
window.trackAllConversions = function(value, transactionId) {
  console.log(`📊 [Tracking] Disparando conversões - Valor: R$ ${value} | ID: ${transactionId}`);

  const results = {
    googleAds: window.trackGoogleAdsConversion(value, transactionId),
    metaAds: window.trackMetaAdsConversion(value, transactionId),
  };

  // Salvar no localStorage para debug
  const conversionLog = JSON.parse(localStorage.getItem("conversionLog") || "[]");
  conversionLog.push({
    timestamp: new Date().toISOString(),
    site: window.SITE_CONFIG?.SITE_ID,
    value: value,
    transactionId: transactionId,
    results: results,
  });
  // Manter apenas os últimos 50 registros
  if (conversionLog.length > 50) conversionLog.shift();
  localStorage.setItem("conversionLog", JSON.stringify(conversionLog));

  return results;
};
