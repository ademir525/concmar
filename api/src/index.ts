import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import QRCode from "qrcode";
import dns from "dns";
import db, { initializeDatabase, testConnection } from "./db";

// Forçar uso de IPv4 para conexões de saída (evita erro "IP não liberado" com IPv6)
dns.setDefaultResultOrder("ipv4first");
console.log("🌐 DNS configurado para preferir IPv4");

const app = new Hono();

// Configurações
const PORT = process.env.PORT || 3000;
const MANGOFY_API_KEY = process.env.MANGOFY_API_KEY || "";
const MANGOFY_STORE_CODE = process.env.MANGOFY_STORE_CODE || "";
const MANGOFY_API_URL = "https://checkout.mangofy.com.br/api/v1";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");
const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://painel.seletivosbrasil.com/api/webhook";
const DEFAULT_PHONE = process.env.DEFAULT_PHONE || "11999999999";
const PIX_EXPIRATION_MINUTES = parseInt(process.env.PIX_EXPIRATION_MINUTES || "30", 10);

// Inicializar banco de dados
(async () => {
  try {
    const connected = await testConnection();
    if (connected) {
      await initializeDatabase();
    } else {
      console.warn("⚠️ API iniciando sem conexão com banco de dados - pagamentos não serão persistidos");
    }
  } catch (error) {
    console.error("❌ Erro na inicialização do banco:", error);
  }
})();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ALLOWED_ORIGINS,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Interface para o payload de pagamento
interface PaymentRequest {
  cpf: string;
  name: string;
  email: string;
  phone?: string;
  amount: number; // valor em centavos
  description: string;
  externalCode?: string;
  sessionId?: string; // ID de sessão para evitar duplicatas
}

interface MangofyPaymentResponse {
  payment_code: string;
  payment_method: string;
  payment_status: string;
  payment_amount: number;
  sale_amount: number;
  expires_at?: string;
  pix?: {
    pix_qrcode_text?: string;
    qr_code?: string;
    qr_code_base64?: string;
    copy_paste?: string;
  };
}

import type { RowDataPacket } from "mysql2";

interface PagamentoPixRow extends RowDataPacket {
  id: number;
  session_id: string;
  txid: string | null;
  payment_code: string;
  qr_code: string;
  qr_code_image: string;
  copia_cola: string;
  cpf: string;
  name: string;
  email: string;
  amount: number;
  description: string;
  status: string;
  external_code: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

// Rota de health check
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API de Pagamentos PIX ativa" });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Função para gerar PIX na API Mangofy
async function gerarPixNaMangofy(body: PaymentRequest, clientIp: string): Promise<{
  success: boolean;
  paymentCode?: string;
  status?: string;
  amount?: number;
  externalCode?: string;
  pixCode?: string;
  qrCodeBase64?: string;
  expiresAt?: string;
  error?: string;
  details?: unknown;
}> {
  const cleanCpf = body.cpf.replace(/\D/g, "");
  const externalCode = body.externalCode || `CONCSP-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const cleanPhone = (body.phone || "").replace(/\D/g, "") || DEFAULT_PHONE;

  const mangofyPayload = {
    store_code: MANGOFY_STORE_CODE,
    external_code: externalCode,
    payment_method: "pix",
    payment_format: "regular",
    installments: 1,
    payment_amount: body.amount,
    shipping_amount: 0,
    postback_url: WEBHOOK_URL,
    items: [
      {
        code: "TAXA-INSCRICAO",
        name: body.description || "Taxa de Inscrição - Concurso",
        amount: 1,
        total: body.amount,
      },
    ],
    customer: {
      email: body.email,
      name: body.name,
      document: cleanCpf,
      phone: cleanPhone,
      ip: clientIp,
    },
    pix: {
      expires_in_days: 1,
    },
  };

  console.log("📤 Enviando requisição para Mangofy:", JSON.stringify(mangofyPayload, null, 2));

  const response = await fetch(`${MANGOFY_API_URL}/payment`, {
    method: "POST",
    headers: {
      Authorization: MANGOFY_API_KEY,
      "Store-Code": MANGOFY_STORE_CODE,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(mangofyPayload),
  });

  const responseData = await response.json();
  console.log("📥 Resposta da Mangofy:", JSON.stringify(responseData, null, 2));

  if (!response.ok) {
    return {
      success: false,
      error: "Erro ao gerar pagamento",
      details: responseData,
    };
  }

  const mangofyResponse = responseData as MangofyPaymentResponse;

  const pixCode = mangofyResponse.pix?.pix_qrcode_text ||
                  mangofyResponse.pix?.copy_paste ||
                  mangofyResponse.pix?.qr_code ||
                  "";

  let qrCodeBase64 = "";
  if (pixCode) {
    try {
      qrCodeBase64 = await QRCode.toDataURL(pixCode, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      console.log("✅ QR Code gerado com sucesso");
    } catch (qrError) {
      console.error("❌ Erro ao gerar QR Code:", qrError);
    }
  }

  return {
    success: true,
    paymentCode: mangofyResponse.payment_code,
    status: mangofyResponse.payment_status,
    amount: mangofyResponse.payment_amount,
    externalCode: externalCode,
    pixCode: pixCode,
    qrCodeBase64: qrCodeBase64 || mangofyResponse.pix?.qr_code_base64 || "",
    expiresAt: mangofyResponse.expires_at || "",
  };
}

// Rota para gerar pagamento PIX
app.post("/pix/generate", async (c) => {
  try {
    const body = await c.req.json<PaymentRequest>();

    // Validações
    if (!body.cpf || !body.name || !body.email || !body.amount) {
      return c.json(
        {
          success: false,
          error: "Campos obrigatórios: cpf, name, email, amount",
        },
        400
      );
    }

    if (body.amount < 500) {
      return c.json(
        {
          success: false,
          error: "Valor mínimo: R$ 5,00 (500 centavos)",
        },
        400
      );
    }

    // Gerar sessionId baseado no CPF + email + valor (para identificar pagamentos duplicados)
    const sessionId = body.sessionId || `${body.cpf.replace(/\D/g, "")}-${body.email}-${body.amount}`;
    console.log(`🔑 Session ID: ${sessionId}`);

    // 1️⃣ Verificar se já existe pagamento pendente no banco de dados
    try {
      const [rows] = await db.execute<PagamentoPixRow[]>(
        `SELECT * FROM pagamentos_pix
         WHERE session_id = ? AND status = 'pending' AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [sessionId]
      );

      if (rows && rows.length > 0) {
        const existingPayment = rows[0];
        console.log(`♻️ Reutilizando pagamento existente: ${existingPayment.payment_code}`);

        return c.json({
          success: true,
          reused: true,
          data: {
            paymentCode: existingPayment.payment_code,
            status: existingPayment.status,
            amount: existingPayment.amount,
            amountFormatted: `R$ ${(existingPayment.amount / 100).toFixed(2).replace(".", ",")}`,
            externalCode: existingPayment.external_code,
            pix: {
              qrCode: existingPayment.qr_code || existingPayment.copia_cola,
              qrCodeImage: existingPayment.qr_code_image,
              expiresAt: existingPayment.expires_at?.toISOString() || "",
            },
          },
        });
      }
    } catch (dbError) {
      console.warn("⚠️ Erro ao consultar banco de dados, gerando novo pagamento:", dbError);
    }

    // 2️⃣ Se não existir pagamento pendente, gerar novo PIX via Mangofy
    const getClientIpv4 = (): string => {
      const forwardedFor = c.req.header("x-forwarded-for");
      const realIp = c.req.header("x-real-ip");
      let ip = forwardedFor?.split(",")[0]?.trim() || realIp || "";

      if (ip.includes("::ffff:")) {
        ip = ip.replace("::ffff:", "");
      }

      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (ipv4Regex.test(ip)) {
        return ip;
      }

      console.log(`⚠️ IP não é IPv4 válido: "${ip}", usando fallback`);
      return "177.0.0.1";
    };

    const clientIp = getClientIpv4();
    console.log(`🌐 IP do cliente: ${clientIp}`);

    const pixResult = await gerarPixNaMangofy(body, clientIp);

    if (!pixResult.success) {
      return c.json(
        {
          success: false,
          error: pixResult.error,
          details: pixResult.details,
        },
        400
      );
    }

    // 3️⃣ Salvar novo pagamento no banco de dados
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + PIX_EXPIRATION_MINUTES);

    try {
      const insertQuery = "INSERT INTO pagamentos_pix (session_id, payment_code, qr_code, qr_code_image, copia_cola, cpf, name, email, amount, description, status, external_code, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)";
      const insertValues: (string | number | Date)[] = [
        sessionId,
        pixResult.paymentCode || "",
        pixResult.pixCode || "",
        pixResult.qrCodeBase64 || "",
        pixResult.pixCode || "", // copia_cola é igual ao qrCode
        body.cpf.replace(/\D/g, ""),
        body.name,
        body.email,
        body.amount,
        body.description || "Taxa de Inscrição",
        pixResult.externalCode || "",
        expiresAt
      ];
      await db.execute(insertQuery, insertValues);
      console.log(`✅ Pagamento salvo no banco: ${pixResult.paymentCode}`);
    } catch (dbError) {
      console.warn("⚠️ Erro ao salvar no banco de dados:", dbError);
      // Continua mesmo sem salvar no banco (fallback)
    }

    return c.json({
      success: true,
      reused: false,
      data: {
        paymentCode: pixResult.paymentCode,
        status: pixResult.status,
        amount: pixResult.amount,
        amountFormatted: `R$ ${((pixResult.amount || 0) / 100).toFixed(2).replace(".", ",")}`,
        externalCode: pixResult.externalCode,
        pix: {
          qrCode: pixResult.pixCode,
          qrCodeImage: pixResult.qrCodeBase64,
          expiresAt: pixResult.expiresAt,
        },
      },
    });
  } catch (error) {
    console.error("❌ Erro ao processar pagamento:", error);
    return c.json(
      {
        success: false,
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      500
    );
  }
});

// Rota para consultar status do pagamento
app.get("/pix/status/:paymentCode", async (c) => {
  try {
    const paymentCode = c.req.param("paymentCode");

    if (!paymentCode) {
      return c.json(
        {
          success: false,
          error: "Código do pagamento é obrigatório",
        },
        400
      );
    }

    console.log(`🔍 Consultando status do pagamento: ${paymentCode}`);

    const response = await fetch(`${MANGOFY_API_URL}/payment/${paymentCode}`, {
      method: "GET",
      headers: {
        Authorization: MANGOFY_API_KEY,
        "Store-Code": MANGOFY_STORE_CODE,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const responseData = await response.json();

    console.log(`📬 Resposta Mangofy (status ${paymentCode}):`, JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      return c.json(
        {
          success: false,
          error: "Pagamento não encontrado",
          details: responseData,
        },
        response.status as 400 | 404 | 500
      );
    }

    const paymentData = responseData.data || responseData;
    const paymentStatus = paymentData.payment_status || paymentData.status || "pending";
    console.log(`💳 Status do pagamento: ${paymentStatus}`);

    // Atualizar status no banco de dados se aprovado ou com erro
    if (paymentStatus === "approved" || paymentStatus === "error" || paymentStatus === "refunded") {
      try {
        await db.execute(
          "UPDATE pagamentos_pix SET status = ? WHERE payment_code = ?",
          [paymentStatus, paymentCode]
        );
        console.log(`📝 Status atualizado no banco: ${paymentCode} -> ${paymentStatus}`);
      } catch (dbError) {
        console.warn("⚠️ Erro ao atualizar status no banco:", dbError);
      }
    }

    return c.json({
      success: true,
      data: {
        ...paymentData,
        payment_status: paymentStatus,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao consultar pagamento:", error);
    return c.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      500
    );
  }
});

// Rota para receber webhooks da Mangofy
app.post("/webhook", async (c) => {
  try {
    const body = await c.req.json();

    console.log("📩 Webhook recebido:", JSON.stringify(body, null, 2));

    const { payment_code, payment_status, external_code } = body;

    // Atualizar status no banco de dados
    try {
      await db.execute(
        "UPDATE pagamentos_pix SET status = ? WHERE payment_code = ? OR external_code = ?",
        [payment_status, payment_code, external_code]
      );
      console.log(`📝 Status atualizado via webhook: ${payment_code} -> ${payment_status}`);
    } catch (dbError) {
      console.error("❌ Erro ao atualizar status no banco (webhook):", dbError);
    }

    if (payment_status === "approved") {
      console.log(`✅ Pagamento ${payment_code} (${external_code}) APROVADO!`);
      // TODO: Implementar lógica de confirmação de inscrição
    } else if (payment_status === "refunded") {
      console.log(`🔄 Pagamento ${payment_code} (${external_code}) ESTORNADO!`);
    } else if (payment_status === "error") {
      console.log(`❌ Pagamento ${payment_code} (${external_code}) com ERRO!`);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error);
    return c.json({ received: false, error: "Erro ao processar" }, 500);
  }
});

// Iniciar servidor
console.log(`🚀 API de Pagamentos PIX rodando na porta ${PORT}`);
console.log(`📍 Health check: http://localhost:${PORT}/health`);
console.log(`💳 Gerar PIX: POST http://localhost:${PORT}/pix/generate`);
console.log(`🔍 Status: GET http://localhost:${PORT}/pix/status/:paymentCode`);

export default {
  port: PORT,
  fetch: app.fetch,
};
