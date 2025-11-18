# Build
FROM node:20-slim AS builder
WORKDIR /app

# Instala OpenSSL (Requerido pelo Prisma)
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Run
FROM node:20-slim
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "run", "start"]
