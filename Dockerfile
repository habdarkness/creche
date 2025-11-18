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

RUN npx prisma migrate deploy

EXPOSE 3000
CMD ["npm", "run", "start"]
