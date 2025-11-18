# Build
FROM node:20-slim AS builder
WORKDIR /app

ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Run
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]
