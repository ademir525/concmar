/**
 * UTM Tracker - Captura e armazena parâmetros UTM para rastreamento de conversões
 * Integração com UTMify
 */

(function() {
    'use strict';

    // Chaves de UTM a serem capturadas
    const UTM_KEYS = [
        'utm_source',
        'utm_campaign',
        'utm_medium',
        'utm_term',
        'utm_content',
        'gclid',        // Google Ads Click ID
        'fbclid',       // Facebook Click ID
        'msclkid',      // Microsoft Ads Click ID
        'ttclid',       // TikTok Click ID
        'ref',          // Referência genérica
        'src'           // Source alternativo
    ];

    // Prefixo para localStorage (evita conflitos)
    const STORAGE_PREFIX = 'utmify_';

    /**
     * Captura os parâmetros UTM da URL e salva no localStorage
     * Só sobrescreve se o parâmetro estiver presente na URL (preserva valores anteriores)
     */
    function captureUTMs() {
        const params = new URLSearchParams(window.location.search);
        let capturedAny = false;

        UTM_KEYS.forEach(function(key) {
            const value = params.get(key);
            if (value !== null && value !== '') {
                localStorage.setItem(STORAGE_PREFIX + key, value);
                capturedAny = true;
                console.log(`[UTM Tracker] Capturado: ${key} = ${value}`);
            }
        });

        // Salvar timestamp da captura e URL de origem
        if (capturedAny) {
            localStorage.setItem(STORAGE_PREFIX + 'captured_at', new Date().toISOString());
            localStorage.setItem(STORAGE_PREFIX + 'landing_page', window.location.href);
            localStorage.setItem(STORAGE_PREFIX + 'referrer', document.referrer || '');
            console.log('[UTM Tracker] UTMs salvos com sucesso');
        }
    }

    /**
     * Retorna todos os parâmetros UTM armazenados
     * @returns {Object} Objeto com todos os UTMs capturados
     */
    function getStoredUTMs() {
        const utms = {};

        UTM_KEYS.forEach(function(key) {
            const value = localStorage.getItem(STORAGE_PREFIX + key);
            if (value !== null) {
                utms[key] = value;
            }
        });

        // Adicionar metadados
        const capturedAt = localStorage.getItem(STORAGE_PREFIX + 'captured_at');
        const landingPage = localStorage.getItem(STORAGE_PREFIX + 'landing_page');
        const referrer = localStorage.getItem(STORAGE_PREFIX + 'referrer');

        if (capturedAt) utms._captured_at = capturedAt;
        if (landingPage) utms._landing_page = landingPage;
        if (referrer) utms._referrer = referrer;

        return utms;
    }

    /**
     * Limpa todos os UTMs armazenados
     */
    function clearUTMs() {
        UTM_KEYS.forEach(function(key) {
            localStorage.removeItem(STORAGE_PREFIX + key);
        });
        localStorage.removeItem(STORAGE_PREFIX + 'captured_at');
        localStorage.removeItem(STORAGE_PREFIX + 'landing_page');
        localStorage.removeItem(STORAGE_PREFIX + 'referrer');
        console.log('[UTM Tracker] UTMs limpos');
    }

    /**
     * Verifica se há UTMs armazenados
     * @returns {boolean}
     */
    function hasUTMs() {
        return UTM_KEYS.some(function(key) {
            return localStorage.getItem(STORAGE_PREFIX + key) !== null;
        });
    }

    // Executar captura ao carregar a página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', captureUTMs);
    } else {
        captureUTMs();
    }

    // Expor funções globalmente para uso em outras partes do site
    window.UTMTracker = {
        capture: captureUTMs,
        getAll: getStoredUTMs,
        clear: clearUTMs,
        has: hasUTMs,
        KEYS: UTM_KEYS,
        PREFIX: STORAGE_PREFIX
    };

    console.log('[UTM Tracker] Inicializado');
})();
