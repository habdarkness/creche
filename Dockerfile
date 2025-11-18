# Build
FROM node:20-slim AS builder
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN npm install
COPY . .

# Ignorar erro 500 caso o servidor da Prisma esteja instável
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

RUN npx prisma generate
RUN npm run build

# Run
FROM node:20-slim
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
