# Usar imagem oficial do Bun
FROM oven/bun:1 AS base
WORKDIR /app

# Instalar dependências
FROM base AS install
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# Build e produção
FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY . .

# Configurar usuário não-root
USER bun

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["bun", "run", "start"]
