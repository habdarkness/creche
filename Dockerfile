# Build
FROM node:20-alpine AS builder
WORKDIR /app

# ⬅️ Precisa estar aqui, antes do prisma generate
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Run
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
