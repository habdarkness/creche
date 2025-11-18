# Build
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# Run
FROM node:20
WORKDIR /app

# Copia apenas o necessário do standalone
COPY --from=builder /app/.next/standalone ./ 
COPY --from=builder /app/.next/static ./public/.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
