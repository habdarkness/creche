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

COPY --from=builder /app ./

ENV PORT=3000   

EXPOSE 3000

CMD ["node", "node_modules/.bin/next", "start", "-p", "$PORT", "-H", "0.0.0.0"]
