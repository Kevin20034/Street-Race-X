# 🏁 Street Race X API

Una API REST para una plataforma tipo "Tinder" orientada a pilotos de carreras callejeras. Los usuarios pueden registrarse, gestionar vehículos, retar a otros pilotos, aceptar o rechazar retos, completar carreras y subir de rango según sus victorias.

---

## 📋 Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Documentación API](#documentación-api)
- [Reglas de Negocio](#reglas-de-negocio)
- [Demo](#demo)
- [Ejemplos](#ejemplos)

---

## 🛠️ Tecnologías

| Tecnología | Versión/Descripción |
|---|---|
| **Node.js** | >= 18 |
| **Express.js** | Framework HTTP |
| **TypeScript** | Tipado estricto |
| **PostgreSQL** | Base de datos |
| **Prisma ORM** | ORM moderno |
| **Socket.io** | WebSockets real-time |
| **JWT** | Autenticación segura |
| **bcrypt** | Hash de contraseñas |
| **Zod** | Validación de datos |
| **Swagger** | Documentación interactiva |

---

## 🏗️ Arquitectura

El proyecto utiliza **MVC + Services + Repositories** para una estructura escalable y mantenible.

### Estructura de Carpetas

```
src/
├── config/          # Configuración (env, Prisma, Swagger)
├── controllers/     # Manejo de requests HTTP
├── middlewares/     # Auth, validaciones, errores
├── models/          # Schemas Zod y tipos TypeScript
├── repositories/    # Acceso a base de datos
├── routes/          # Definición de endpoints
├── services/        # Lógica de negocio
├── sockets/         # Socket.io
├── utils/           # Helpers reutilizables
├── app.ts           # Configuración Express
├── index.ts         # Punto de entrada
└── server.ts        # Inicio del servidor
```

### Responsabilidades por Capa

| Capa | Responsabilidad |
|---|---|
| **Controllers** | Reciben requests HTTP y devuelven respuestas |
| **Services** | Contienen toda la lógica de negocio |
| **Repositories** | Encapsulan acceso a BD mediante Prisma |
| **Routes** | Definen endpoints de la API |
| **Middlewares** | Autenticación, autorización, validaciones |
| **Models** | Schemas Zod para validación |
| **Config** | Variables de entorno, Prisma, Swagger |
| **Sockets** | Socket.io y emisión de eventos real-time |
| **Utils** | JWT, respuestas estándar, errores personalizados |

### Entidades Principales

- **User** - Usuarios del sistema
- **Vehicle** - Vehículos de los usuarios
- **Challenge** - Retos entre usuarios
- **Notification** - Sistema de notificaciones
- **CompetitionCategory** - Categorías de competencia

---

## 📦 Instalación

### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18 o superior
- **PostgreSQL** (base de datos)
- **Git** (para clonar el repositorio)
- **VS Code** (opcional, recomendado para desarrollo)

### 1. Clonar el proyecto

```bash
git clone URL_DEL_REPOSITORIO
cd street-race-x-api
```

### 2. Instalar dependencias

**En Windows PowerShell:**
```bash
npm.cmd install
```

**En CMD, Git Bash, macOS o Linux:**
```bash
npm install
```

### 3. Crear archivo .env

Crea un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/street_race_x?schema=public" forma local

DATABASE_URL="postgresql://neondb_owner:npg_nPlSDF9o6aWG@ep-fancy-violet-aqrhq0ye-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" forma online con neon

JWT_SECRET="super_secret_change_me"
JWT_EXPIRES_IN="7d"

BCRYPT_SALT_ROUNDS=10

CLIENT_URL="http://localhost:5173"

```


> **Nota:** Ajusta el usuario y contraseña de PostgreSQL según tu configuración local.

### 4. Crear base de datos

En PostgreSQL, crea una base de datos llamada `street_race_x`. Puedes hacerlo desde pgAdmin o ejecutando el siguiente comando SQL:

```sql
CREATE DATABASE street_race_x;
```

### 5. Ejecutar migraciones Prisma

**En Windows PowerShell:**
```bash
npx.cmd prisma migrate dev
```

**En otros sistemas:**
```bash
npx prisma migrate dev
```

Luego, genera el cliente de Prisma:

```bash
npx prisma generate
```

### 6. Levantar el servidor

**En Windows PowerShell:**
```bash
npm.cmd run dev
```

**En otros sistemas:**
```bash
npm run dev
```

### 7. Probar la API

- **Health check:** http://localhost:3000/api/health
- **Documentación Swagger:** http://localhost:3000/api/docs

---

## 🚀 Ejecución

Una vez completados los pasos de instalación, el servidor ya estará corriendo. Si necesitas reiniciarlo:

### Modo Desarrollo

```bash
npm run dev
```

La API estará disponible en: **http://localhost:3000**

### Health Check

```
GET http://localhost:3000/api/health
```

---

## 📚 Documentación API

### Swagger UI

**URL:** http://localhost:3000/api/docs

Interfaz interactiva para explorar y probar todos los endpoints.

### OpenAPI JSON

**URL:** http://localhost:3000/api/docs.json

---

## 🎮 Reglas de Negocio

### 🚗 Vehículos

- Máximo **3 vehículos** por usuario
- Solo **1 vehículo activo** a la vez
- Al activar un vehículo, los demás se desactivan automáticamente

### 🥊 Retos

Restricciones para crear un reto:
- ❌ No puedes retarte a ti mismo
- ✅ Los usuarios deben estar en el **mismo rango**
- ✅ Los vehículos deben ser del **mismo tipo**

Estados posibles:
```
PENDING    → Esperando respuesta
ACCEPTED   → Aceptado
REJECTED   → Rechazado
CANCELLED  → Cancelado
COMPLETED  → Finalizado
```

### 🏆 Sistema de Rangos

**Progresión:** `D` → `C` → `B` → `A` → `S`

#### Reglas de Rango

| Regla | Descripción |
|---|---|
| **Inicio** | Todo usuario empieza en rango **D** |
| **Victorias Consecutivas** | Cada victoria suma +1 |
| **Ascenso** | Con 2 victorias consecutivas, subes de rango |
| **Reset** | Al subir de rango, las victorias vuelven a 0 |
| **Derrota** | Resta 1 victoria consecutiva (mínimo 0) |
| **Sin Descenso** | No existe descenso de rango |

---

## 🎬 Demo Workflow

Flujo recomendado para presentar el proyecto:

1. Abrir Swagger: http://localhost:3000/api/docs
2. Registrar **usuario A**
3. Registrar **usuario B**
4. Hacer login con ambos usuarios
5. Crear vehículo para usuario A
6. Crear vehículo para usuario B
7. Activar los vehículos
8. Crear un reto: usuario A → usuario B
9. Aceptar el reto con usuario B
10. Completar el reto indicando el ganador
11. Verificar estadísticas del ganador
12. Repetir una segunda victoria para ver la **subida de rango**
13. Consultar notificaciones

# Street Race X API

Backend API para el proyecto **Street Race X**, desarrollado con Node.js, Prisma y PostgreSQL usando Neon.

---

# Requisitos

Antes de ejecutar el proyecto necesitas instalar:

* Node.js 18 o superior
* Git
* VS Code (opcional)
* Conexión a Internet



---

# Clonar el proyecto

```bash
git clone URL_DEL_REPOSITORIO
cd street-race-x-api
```

---

# Instalar dependencias

## En PowerShell

```powershell
npm.cmd install
```

## En CMD, Git Bash, macOS o Linux

```bash
npm install
```

---

# Configurar variables de entorno

En la raíz del proyecto crea un archivo llamado:

```bash
.env
```

Agrega el siguiente contenido:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://neondb_owner:npg_nPlSDF9o6aWG@ep-fancy-violet-aqrhq0ye-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

JWT_SECRET="super_secret_change_me"
JWT_EXPIRES_IN="7d"

BCRYPT_SALT_ROUNDS=10

CLIENT_URL="http://localhost:5173"
```



---

# Configuración de Prisma

## Archivo `prisma.config.ts`

Debe existir en la raíz del proyecto:

```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

---

## Archivo `prisma/schema.prisma`

El datasource debe estar configurado así:

```prisma
datasource db {
  provider = "postgresql"
}
```

> Esta configuración es correcta para Prisma 7.

---

# Generar Prisma Client

## En PowerShell

```powershell
npx.cmd prisma generate
```

## En otros sistemas

```bash
npx prisma generate
```

---

# Ejecutar migraciones en Neon

Si la base de datos Neon ya tiene las tablas creadas puedes omitir este paso.

## En PowerShell

```powershell
npx.cmd prisma migrate dev
```

## En otros sistemas

```bash
npx prisma migrate dev
```

Esto creará las tablas necesarias en Neon.

---

# Levantar el proyecto

## En PowerShell

```powershell
npm.cmd run dev
```

Debe mostrarse algo como:

```bash
Street Race X API running on http://localhost:3000
```

---

# URLs importantes

## Frontend

```txt
http://localhost:3000/
```

## Swagger

```txt
http://localhost:3000/api/docs
```

## Health Check

```txt
http://localhost:3000/api/health
```

---

# Login de prueba

Si Neon ya contiene datos puedes iniciar sesión con:

```json
{
  "email": "kevin@test.com",
  "password": "123456"
}
```

Si la base de datos está vacía puedes registrar usuarios desde el frontend o Swagger.

---

# Pruebas unitarias

Las pruebas unitarias utilizan mocks y no dependen de Neon.

## Ejecutar pruebas

```powershell
npm.cmd run test
```

## Ejecutar cobertura

```powershell
npm.cmd run test:coverage
```

> La cobertura debe superar el 75%.

---

# Docker para pruebas

Docker es opcional y solo se utiliza para levantar una base de datos local de pruebas.

## Levantar contenedor

```powershell
npm.cmd run test:db:up
```

## Detener contenedor

```powershell
npm.cmd run test:db:down
```

> Para las pruebas unitarias actuales no es obligatorio utilizar Docker.

---

# Tecnologías utilizadas

* Node.js
* Express
* Prisma ORM
* PostgreSQL
* Neon Database
* JWT Authentication
* Swagger
* Jest

---

# Autor

Proyecto desarrollado para Street Race X.
