# Usamos una version ligera de node
FROM node:22-alpine AS build

# Crea el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias primero (optimiza el cache)
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copia el resto del codigo del back
COPY . .

# Expone el puerto donde corre el servidor
EXPOSE 5000

# Comando para inciar la aplicacion
CMD ["npm", "start"]





