# NeuroCoin: Plataforma Inteligente de Monitoreo y Analítica Predictiva de Criptomonedas

NeuroCoin es una plataforma web inteligente diseñada para el monitoreo, análisis y proyección en tiempo real de criptomonedas y activos financieros. El sistema centraliza información crítica proveniente de APIs públicas del sector financiero, permitiendo a los usuarios visualizar de manera intuitiva fluctuaciones de precios, variaciones porcentuales e historiales de rendimiento mediante gráficos dinámicos y alertas personalizadas de volatilidad. 

El valor diferencial de la plataforma radica en la integración de un componente de analítica predictiva basado en **Machine Learning (Python)** para la estimación de tendencias futuras de precios.

---

## Tópicos Tecnológicos Implementados

1. **API Integration:** Consumo de APIs financieras especializadas para la extracción automatizada de datos históricos y en tiempo real.
2. **Machine Learning (Python):** Implementación de modelos predictivos orientados a la estimación de tendencias y proyecciones de precios.
3. **DevOps & Containerization (Docker):** Uso de Docker y Docker Compose para empaquetar, aislar y orquestar los entornos distribuidos del Frontend, Backend y el servicio de IA.
4. **CI/CD Pipeline (GitHub Actions):** Automatización del flujo de trabajo mediante Integración Continuo (CI) para validación de código y Despliegue Continuo (CD) para la construcción y envío automático de imágenes Docker.
5. **Cloud Computing:** Despliegue de la infraestructura multi-contenedor en un proveedor de nube para asegurar la escalabilidad, acceso público y alta disponibilidad.

---

## Arquitectura del Sistema

El sistema adopta formalmente una arquitectura de **microservicios distribuidos** acoplada a una cultura DevOps, donde cada componente se aisla en contenedores independientes para asegurar la consistencia del entorno de ejecución.

* **Frontend Dashboard:** Interfaz de usuario responsiva y dinámica que consume los datos procesados y renderiza los gráficos de volatilidad.
* **Backend REST API:** Orquestador principal encargado de la lógica de negocio, persistencia de datos y pasarela de las APIs financieras.
* **Servicio de IA (Predictivo):** Microservicio independiente en Python que ejecuta el modelo de Machine Learning y expone endpoints para consultar proyecciones financieras.

---


## Despliegue

El sistema está compuesto por dos repositorios independientes que se comunican de forma aislada dentro de la misma máquina mediante una red puente interna de Docker:

* **Red Docker Compartida:** `neurocoin_network` (Externa/Manual)
* **Contenedor Frontend:** React (Puerto `80:80`). Se compila apuntando explícitamente a la IP pública del Backend (`http://IP_PUBLICA:5000`).
* **Contenedor Backend:** Node.js (Puerto `5000:5000`). Consume Binance API, MongoDB Atlas y Gemini. Se comunica internamente con la IA a través de la URL: `http://neurocoin_ai_service:8000`.
* **Contenedor IA:** Python/FastAPI/Flask (Puerto `8000:8000`). Nombre de contenedor reservado: `neurocoin_ai_service`.

---

## Configuración Local (Fase Actual - Núcleo Funcional)

Sigue estos pasos para levantar el proyecto localmente en tu entorno de desarrollo.

### Requisitos Previos
* [Node.js](https://nodejs.org/) (Versión v18 o superior recomendada)
* [Git](https://git-scm.com/)

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/neurocoin.git](https://github.com/tu-usuario/neurocoin.git)
cd neurocoin
```

## Ejecución Local con Docker
Para ejecutar el proyecto Neurocoin en tu propia máquina de forma idéntica a cómo se evalúa en nuestro entorno de Integración Continua (CI), sigue estos pasos:

### Instrucciones paso a paso

**1. Actualizar tu Entorno Local**
Asegúrate de tener la última versión de la rama principal (`main`):
```bash
    git checkout main 
    git pull origin  main 
```

**Pasos para correr localmente docker**

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
* Detener contenedores 
```bash
    docker compose down
```
http://35.159.123.31
