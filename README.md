## 🐳 Ejecución Local con Docker
Para ejecutar el proyecto Neurocoin en tu propia máquina de forma idéntica a cómo se evalúa en nuestro entorno de Integración Continua (CI), sigue estos pasos:

### Requisitos Previos
* Tener instalado [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Instrucciones paso a paso

**1. Actualizar tu Entorno Local**
Asegúrate de tener la última versión de la rama principal (`main`):
```bash
    git checkout main 
    git pull origin  main 
```

**2. Configurar Variables de Entorno**
- Navega a la carpeta backend/.
- Copia el archivo .env.example y renómbralo a .env.
- Abre el nuevo archivo .env y rellena las variables con las credenciales correspondientes 

**3. Pasos para correr localmente docker**

i. Crear la red en la laptop (Solo se hace una vez en la vida)
```bash
    docker network create neurocoin_network
```
ii. Encender el servicio de IA
```bash
docker compose up -d --build
```

iii. Encender el proyecto Web
```bash
docker compose up -d --build
```

* Verificar el funcionamiento
```bash
    docker ps 
```
* Detener Infraestructura
```bash
    docker compose down
```


## SERVIDOR AWS DESDE LA TERMINAL 
ssh -i "neurocoin-key.pem" ubuntu@18.116.242.109