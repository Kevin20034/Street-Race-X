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

---

## 📝 Ejemplos

### Registro de Usuario

```json
{
  "name": "Kevin Racer",
  "email": "kevin@test.com",
  "password": "123456"
}
```

### Crear Vehículo

```json
{
  "name": "Night Fury",
  "brand": "Nissan",
  "model": "Skyline R34",
  "year": 1999,
  "type": "CAR",
  "horsepower": 480
}
```

### Crear Reto

```json
{
  "receiverId": "uuid-del-rival",
  "senderVehicleId": "uuid-del-vehiculo",
  "message": "Carrera esta noche",
  "location": "Avenida Central"
}
```

---

## ✅ Buenas Prácticas Aplicadas

- ✔️ Separación clara de responsabilidades
- ✔️ TypeScript con tipado estricto
- ✔️ Validación de datos con Zod
- ✔️ Manejo centralizado de errores
- ✔️ Respuestas HTTP estandarizadas
- ✔️ Contraseñas hasheadas con bcrypt
- ✔️ Autenticación JWT segura
- ✔️ Autorización por roles
- ✔️ ORM Prisma para seguridad BD
- ✔️ Documentación Swagger completa
- ✔️ Estructura MVC escalable

---

## 📊 Estado del Proyecto

El backend está **funcional y listo** para la primera entrega.

### Características Incluidas

✅ Autenticación con JWT  
✅ Gestión de usuarios  
✅ Gestión de vehículos  
✅ Sistema completo de retos  
✅ Sistema de rangos dinámico  
✅ Notificaciones en tiempo real  
✅ Socket.io preparado  
✅ Documentación Swagger interactiva  

---

## 👨‍💻 Autor

**Kevin** - Desarrollo Full Stack
