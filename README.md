# Sistema de Gestión de Consultas (Veterinaria) - PMN

Aplicación Next.js (Prototipo Mínimo Navegable) para el proyecto de Desarrollo de Aplicaciones Empresariales.

## 🚀 Guía Rápida de Instalación y Uso

Todo el entorno está dockerizado para que sea muy fácil de ejecutar, sin necesidad de instalar dependencias locales de Node.js. 

### 1. Requisitos previos
- Solo necesitas tener instalado **Docker** y **Docker Compose** en tu computadora.

### 2. Levantar el proyecto
Abre una terminal en la ruta principal del repositorio y ejecuta:

```bash
docker compose up -d --build
```
*(Este comando descargará lo necesario, instalará dependencias e iniciará el proyecto en segundo plano).*

### 3. Ver la aplicación
Una vez que el comando haya terminado, simplemente abre tu navegador y visita:
👉 **http://localhost:3000**

---

### 🛠️ Comandos útiles para administrar el proyecto

Para **apagar** el proyecto y detener los contenedores:
```bash
docker compose down
```

Para **ver los registros (logs)** en tiempo real:
```bash
docker compose logs -f
```

Para **volver a levantar** el sistema (si ya lo construiste una vez):
```bash
docker compose up -d
```
