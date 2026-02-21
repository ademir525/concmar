import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import QRCode from "qrcode";
import dns from "dns";

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

// Rota de health check
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API de Pagamentos PIX ativa" });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

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

    // Limpar CPF (remover pontos e traços)
    const cleanCpf = body.cpf.replace(/\D/g, "");

    // Gerar código externo único
    const externalCode = body.externalCode || `CONCSP-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Limpar telefone (remover caracteres não numéricos)
    const cleanPhone = (body.phone || "").replace(/\D/g, "") || DEFAULT_PHONE;

    // Função para extrair IPv4 válido
    const getClientIpv4 = (): string => {
      const forwardedFor = c.req.header("x-forwarded-for");
      const realIp = c.req.header("x-real-ip");

      // Pegar o primeiro IP da lista (x-forwarded-for pode ter múltiplos IPs)
      let ip = forwardedFor?.split(",")[0]?.trim() || realIp || "";

      // Se for IPv6-mapped IPv4 (::ffff:192.168.1.1), extrair o IPv4
      if (ip.includes("::ffff:")) {
        ip = ip.replace("::ffff:", "");
      }

      // Verificar se é um IPv4 válido (formato: X.X.X.X)
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (ipv4Regex.test(ip)) {
        return ip;
      }

      // Se for IPv6 puro ou inválido, usar um IP padrão
      console.log(`⚠️ IP não é IPv4 válido: "${ip}", usando fallback`);
      return "177.0.0.1"; // IP brasileiro genérico como fallback
    };

    const clientIp = getClientIpv4();
    console.log(`🌐 IP do cliente: ${clientIp}`);

    // Payload para a API Mangofy
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

    console.log("Enviando requisição para Mangofy:", JSON.stringify(mangofyPayload, null, 2));

    // Fazer requisição para a API Mangofy
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

    console.log("Resposta da Mangofy:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      return c.json(
        {
          success: false,
          error: "Erro ao gerar pagamento",
          details: responseData,
        },
        response.status as 400 | 401 | 403 | 404 | 500
      );
    }

    const mangofyResponse = responseData as MangofyPaymentResponse;

    // Extrair código PIX (verificar todos os campos possíveis)
    const pixCode = mangofyResponse.pix?.pix_qrcode_text ||
                    mangofyResponse.pix?.copy_paste ||
                    mangofyResponse.pix?.qr_code ||
                    "";

    console.log("Código PIX extraído:", pixCode);

    // Gerar QR Code como base64 se tivermos o código PIX
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
        console.log("QR Code gerado com sucesso");
      } catch (qrError) {
        console.error("Erro ao gerar QR Code:", qrError);
      }
    } else {
      console.warn("Nenhum código PIX encontrado na resposta");
    }

    return c.json({
      success: true,
      data: {
        paymentCode: mangofyResponse.payment_code,
        status: mangofyResponse.payment_status,
        amount: mangofyResponse.payment_amount,
        amountFormatted: `R$ ${(mangofyResponse.payment_amount / 100).toFixed(2).replace(".", ",")}`,
        externalCode: externalCode,
        pix: {
          qrCode: pixCode,
          qrCodeImage: qrCodeBase64 || mangofyResponse.pix?.qr_code_base64 || "",
          expiresAt: mangofyResponse.expires_at || "",
        },
      },
    });
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
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

    // A Mangofy retorna os dados dentro de "data", então precisamos extrair
    const paymentData = responseData.data || responseData;

    // Normalizar o status para garantir compatibilidade
    const paymentStatus = paymentData.payment_status || paymentData.status || "pending";
    console.log(`💳 Status do pagamento: ${paymentStatus}`);

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

    console.log("Webhook recebido:", JSON.stringify(body, null, 2));

    // Aqui você pode implementar a lógica para:
    // - Atualizar o status do pagamento no seu banco de dados
    // - Enviar email de confirmação
    // - Liberar acesso ao usuário
    // etc.

    const { payment_code, payment_status, external_code } = body;

    if (payment_status === "approved") {
      console.log(`Pagamento ${payment_code} (${external_code}) APROVADO!`);
      // TODO: Implementar lógica de confirmação de inscrição
    } else if (payment_status === "refunded") {
      console.log(`Pagamento ${payment_code} (${external_code}) ESTORNADO!`);
    } else if (payment_status === "error") {
      console.log(`Pagamento ${payment_code} (${external_code}) com ERRO!`);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
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
