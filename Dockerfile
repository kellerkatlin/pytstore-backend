# Etapa 1: build
FROM node:22-alpine AS builder

WORKDIR /app

# Instala solo los paquetes necesarios para construir
COPY package*.json ./
RUN npm install

# Copiar prisma schema y generar cliente antes de compilar
COPY prisma ./prisma
RUN npx prisma generate

# Copia todo el código fuente y compila
COPY . .
RUN npm run build

# Etapa 2: imagen final
FROM node:22-alpine

WORKDIR /app

# Copia solo lo necesario desde la etapa de construcción
COPY package*.json ./
RUN npm install --production

# Copia los archivos ya compilados
COPY --from=builder /app/dist ./dist

# Expone el puerto (ajusta si tu app usa otro)
EXPOSE 3000

# Comando para iniciar la app
CMD ["node", "dist/main"]
