<?php
header("Content-Type: application/json; charset=utf-8");

// Se front e PHP estiverem no mesmo domínio, não precisa de CORS.
// header("Access-Control-Allow-Origin: https://SEU-DOMINIO.com");

$cpf = preg_replace('/\D/', '', $_GET['cpf'] ?? '');
if (strlen($cpf) !== 11) { http_response_code(400); echo json_encode(['error'=>'cpf inválido']); exit; }

// ⚠️ Chave colocada diretamente (apenas se você decidiu assim)
$apiKey = '510bb2322da6bbf21d789458ef4fa67b329bad284b629652c83014141a631ed2';

$ch = curl_init("https://api.cpf-brasil.org/cpf/$cpf");
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Accept: application/json",
    "X-API-Key: $apiKey",
  ],
  CURLOPT_TIMEOUT => 15,
]);

$body = curl_exec($ch);
$errno = curl_errno($ch);
$err  = curl_error($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE) ?: 502;
curl_close($ch);

if ($errno !== 0) {
  http_response_code(502);
  echo json_encode(['error' => 'Bad gateway', 'detail' => $err]);
  exit;
}

http_response_code($code);
echo $body ?: json_encode(['error' => 'Resposta vazia']);
