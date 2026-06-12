# --- ETAPA 1: Construcción (Node.js) ---
FROM node:22-alpine AS build

# Creamos y nos movemos a la carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias para optimizar la caché de Docker
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos del frontend
COPY . .

# Compilamos el proyecto con Vite (esto crea la carpeta /dist)
RUN npm run build


# --- ETAPA 2: Producción (Nginx) ---
FROM nginx:alpine

# Copiamos ÚNICAMENTE la carpeta /dist compilada desde la etapa anterior
# hacia la carpeta pública de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponemos el puerto 80 (el estándar para web)
EXPOSE 80

# Comando para encender el servidor Nginx y mantenerlo corriendo
CMD ["nginx", "-g", "daemon off;"]