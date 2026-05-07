# Street Race X API

Street Race X es una API REST para una plataforma tipo "Tinder" orientada a pilotos de carreras callejeras. Los usuarios pueden registrarse, gestionar vehículos, retar a otros pilotos, aceptar o rechazar retos, completar carreras y subir de rango según sus victorias.

## Tecnologías Utilizadas

- Node.js >= 18
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Socket.io
- JWT con jsonwebtoken
- bcrypt
- Zod
- Swagger
- Arquitectura MVC con Services y Repositories

## Arquitectura

El proyecto usa una arquitectura MVC adaptada para APIs REST escalables.

```text
src/
  config/
  controllers/
  middlewares/
  models/
  repositories/
  routes/
  services/
  sockets/
  utils/
  app.ts
  server.ts

Carpetas principales
controllers/: reciben las peticiones HTTP y devuelven respuestas.
services/: contienen la lógica de negocio.
repositories/: encapsulan el acceso a la base de datos mediante Prisma.
routes/: definen los endpoints de la API.
middlewares/: contienen autenticación, autorización, validaciones y manejo de errores.
models/: contienen schemas de validación y tipos auxiliares.
config/: configuración de entorno, Prisma y Swagger.
sockets/: configuración de Socket.io y emisión de eventos.
utils/: helpers reutilizables como JWT, respuestas estándar y errores personalizados.

Entidades Principales
User
Vehicle
Challenge
CompetitionCategory
Notification


Reglas de Negocio
Vehículos
Cada usuario puede tener máximo 3 vehículos.
Un usuario puede activar un vehículo.
Al activar un vehículo, los demás vehículos del mismo usuario se desactivan.



Retos
Un usuario no puede retarse a sí mismo.
Los usuarios deben estar en el mismo rango.
Los vehículos deben ser del mismo tipo.
Un reto puede estar en estado:
PENDING
ACCEPTED
REJECTED
CANCELLED
COMPLETED


Sistema de Rangos
Los rangos son:

D -> C -> B -> A -> S



Reglas:

El usuario empieza en rango D.
Cada victoria suma 1 victoria consecutiva.
Con 2 victorias consecutivas, el usuario sube de rango.
Al subir de rango, las victorias consecutivas vuelven a 0.
Una derrota resta 1 victoria consecutiva, con mínimo 0.
No existe descenso de rango.



Instalación
Clonar o abrir el proyecto:

cd C:\Users\kevin\street-race-x-api


Instalar dependencias:

npm.cmd install


Variables de Entorno
Crear un archivo .env en la raíz del proyecto:

NODE_ENV=development
PORT=3000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/street_race_x?schema=public"

JWT_SECRET="super_secret_change_me"
JWT_EXPIRES_IN="7d"

BCRYPT_SALT_ROUNDS=10

CLIENT_URL="http://localhost:5173"


Base de Datos
Crear la base de datos en PostgreSQL:

street_race_x
Ejecutar migraciones:

npx.cmd prisma migrate dev
Generar cliente Prisma:

npx.cmd prisma generate
Abrir Prisma Studio:

npx.cmd prisma studio



Ejecutar el Proyecto
Modo desarrollo:

npm.cmd run dev
La API queda disponible en:

http://localhost:3000
Health check:

GET http://localhost:3000/api/health


Documentación Swagger
La documentación de la API está disponible en:

http://localhost:3000/api/docs
El JSON de OpenAPI está disponible en:

http://localhost:3000/api/docs.json



Workflow de Demo
Flujo recomendado para presentar el proyecto:

Abrir Swagger en http://localhost:3000/api/docs.
Registrar usuario A.
Registrar usuario B.
Hacer login con ambos usuarios.
Crear vehículo para usuario A.
Crear vehículo para usuario B.
Activar los vehículos.
Crear un reto desde usuario A hacia usuario B.
Aceptar el reto con usuario B.
Completar el reto indicando el ganador.
Verificar estadísticas del ganador.
Repetir una segunda victoria para demostrar la subida de rango.
Consultar notificaciones.
Ejemplo de Registro
{
  "name": "Kevin Racer",
  "email": "kevin@test.com",
  "password": "123456"
}
Ejemplo de Vehículo
{
  "name": "Night Fury",
  "brand": "Nissan",
  "model": "Skyline R34",
  "year": 1999,
  "type": "CAR",
  "horsepower": 480
}
Ejemplo de Reto
{
  "receiverId": "uuid-del-rival",
  "senderVehicleId": "uuid-del-vehiculo",
  "message": "Carrera esta noche",
  "location": "Avenida Central"
}
Buenas Prácticas Aplicadas
Separación de responsabilidades.
TypeScript estricto.
Validación con Zod.
Manejo centralizado de errores.
Respuestas estandarizadas.
Contraseñas hasheadas con bcrypt.
Autenticación con JWT.
Autorización por roles.
ORM Prisma para acceso seguro a PostgreSQL.
Documentación Swagger.
Estructura escalable tipo MVC.
Estado del Proyecto
El backend se encuentra funcional para la primera entrega del proyecto.

Incluye:

Autenticación
Gestión de usuarios
Gestión de vehículos
Sistema de retos
Sistema de rangos
Notificaciones
Socket.io preparado
Documentación Swagger
