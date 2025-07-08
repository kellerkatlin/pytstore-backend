# Etapa 1: build
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependencias para construir
COPY package*.json ./
RUN npm install

# Copiar Prisma schema y generar cliente
COPY prisma ./prisma
RUN npx prisma generate

# Copiar el resto del código y compilar
COPY . .
RUN npm run build

# Etapa 2: imagen final
FROM node:22-alpine

WORKDIR /app

# Instala solo dependencias necesarias en producción
COPY package*.json ./
RUN npm install --production

# Copia archivos necesarios desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Variables necesarias
ENV NODE_ENV=production

# Expone el puerto de la app
EXPOSE 3000

# Ejecuta migraciones y luego arranca la app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
