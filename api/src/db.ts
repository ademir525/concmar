import mysql from 'mysql2/promise';

// Pool de conexões com o banco de dados
const db = mysql.createPool({
  host: process.env.DB_HOST || 'xcgc0k8kc888ogs8ow4kw8o8', // nome do container do banco
  user: process.env.DB_USER || 'pag_user',
  password: process.env.DB_PASSWORD || 'Mariadb@2026',
  database: process.env.DB_NAME || 'pagamentos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Função para testar conexão
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await db.getConnection();
    console.log('✅ Conexão com banco de dados estabelecida');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    return false;
  }
}

// Função para criar tabela se não existir
export async function initializeDatabase(): Promise<void> {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pagamentos_pix (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        txid VARCHAR(255),
        payment_code VARCHAR(255),
        qr_code TEXT,
        qr_code_image LONGTEXT,
        copia_cola TEXT,
        cpf VARCHAR(14),
        name VARCHAR(255),
        email VARCHAR(255),
        amount INT,
        description VARCHAR(500),
        status VARCHAR(50) DEFAULT 'pending',
        external_code VARCHAR(255),
        expires_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_session_status (session_id, status),
        INDEX idx_payment_code (payment_code),
        INDEX idx_external_code (external_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabela pagamentos_pix verificada/criada');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}

export default db;
