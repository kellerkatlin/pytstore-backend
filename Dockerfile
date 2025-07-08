# Etapa 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copia todo el código fuente antes de compilar
COPY . .

# Genera cliente Prisma
RUN npx prisma generate

# Compila NestJS a /dist
RUN npm run build

# Etapa 2: Imagen de producción
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Copia los archivos necesarios desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
