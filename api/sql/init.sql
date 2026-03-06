-- Script de inicialização do banco de dados para pagamentos PIX
-- Execute este script para criar a estrutura necessária

-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS pagamentos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pagamentos;

-- Criar tabela de pagamentos PIX
CREATE TABLE IF NOT EXISTS pagamentos_pix (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL COMMENT 'ID de sessão único para evitar duplicatas',
    txid VARCHAR(255) COMMENT 'Transaction ID do PIX',
    payment_code VARCHAR(255) COMMENT 'Código do pagamento na Mangofy',
    qr_code TEXT COMMENT 'Código PIX copia e cola',
    qr_code_image LONGTEXT COMMENT 'Imagem do QR Code em Base64',
    copia_cola TEXT COMMENT 'Código PIX para cópia',
    cpf VARCHAR(14) COMMENT 'CPF do pagador',
    name VARCHAR(255) COMMENT 'Nome do pagador',
    email VARCHAR(255) COMMENT 'Email do pagador',
    amount INT COMMENT 'Valor em centavos',
    description VARCHAR(500) COMMENT 'Descrição do pagamento',
    status VARCHAR(50) DEFAULT 'pending' COMMENT 'Status: pending, approved, error, refunded',
    external_code VARCHAR(255) COMMENT 'Código externo de referência',
    expires_at DATETIME COMMENT 'Data/hora de expiração do PIX',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Índices para otimização
    INDEX idx_session_status (session_id, status),
    INDEX idx_payment_code (payment_code),
    INDEX idx_external_code (external_code),
    INDEX idx_cpf (cpf),
    INDEX idx_expires (expires_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar usuário para a API (opcional - ajuste conforme necessário)
-- CREATE USER IF NOT EXISTS 'pag_user'@'%' IDENTIFIED BY 'Mariadb@2026';
-- GRANT ALL PRIVILEGES ON pagamentos.* TO 'pag_user'@'%';
-- FLUSH PRIVILEGES;

-- Índice para limpeza automática de pagamentos expirados
-- Útil para executar um job de limpeza periódica
-- DELETE FROM pagamentos_pix WHERE status = 'pending' AND expires_at < NOW() - INTERVAL 7 DAY;
