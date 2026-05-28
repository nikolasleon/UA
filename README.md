# Daydare

Plataforma web para crear y participar en retos diarios. Los usuarios pueden publicar desafíos con imagen, dificultad y categoría, responder retos de otros con fotos o texto, dar likes y explorar perfiles públicos.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, React Router 7, React Icons |
| Backend | Node.js, Express 5 |
| Base de datos | MongoDB Atlas (Mongoose) |
| Almacenamiento | Supabase Storage (imágenes) |
| Deploy | Render (frontend y backend) |

## Estructura del proyecto

```
UA/
├── frontend/          # Aplicación React (Create React App)
│   └── src/
│       ├── pages/     # Vistas principales
│       ├── components/# Componentes reutilizables
│       ├── context/   # AuthContext (sesión de usuario)
│       ├── styles/    # CSS por página
│       └── utils/     # Helpers
└── backend/           # API REST con Express
    ├── models/        # Esquemas Mongoose (User, Challenge, UserChallenge)
    ├── routes/        # Rutas /api/users y /api/challenges
    ├── server.js      # Entrada principal
    └── seedDatabase.js# Scripts de seed
```

## Rutas del frontend

| Ruta | Página | Auth requerida |
|------|--------|---------------|
| `/` | Inicio | No |
| `/login` | Iniciar sesión | No |
| `/register` | Registro | No |
| `/buscar` | Buscar retos/usuarios | No |
| `/about` | Acerca de | No |
| `/reto/:id` | Detalle de reto | No |
| `/profile/:userId` | Perfil público | No |
| `/formularios` | Formularios de accesibilidad | No |
| `/reto/:id/responder` | Responder reto | Sí |
| `/account` | Mi cuenta | Sí |
| `/settings` | Configuración | Sí |
| `/crear-reto` | Crear reto | Sí |
| `/editar-reto/:id` | Editar reto | Sí |
| `/my-challenges/:tipo` | Mis retos / participaciones | Sí |

## API endpoints

### Usuarios — `/api/users`
- `POST /register` — Registro de nuevo usuario
- `POST /login` — Login, devuelve token JWT
- `GET /:id` — Perfil público de usuario
- `PUT /:id` — Actualizar perfil (foto, bio, datos personales)

### Retos — `/api/challenges`
- `GET /` — Listar todos los retos
- `GET /:id` — Detalle de un reto
- `POST /` — Crear reto (auth)
- `PUT /:id` — Editar reto (auth, solo creador)
- `DELETE /:id` — Eliminar reto (auth, solo creador)
- `POST /:id/like` — Dar/quitar like (auth)
- `POST /:id/responder` — Enviar respuesta con imagen (auth)
- `GET /:id/respuestas` — Ver respuestas de un reto

## Instalación local

### Requisitos
- Node.js 18+
- Cuenta en MongoDB Atlas
- Cuenta en Supabase

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd UA
```

### 2. Configurar el backend

```bash
cd backend
cp .env.example .env  # o crear .env manualmente
npm install
```

Variables de entorno necesarias en `backend/.env`:

```env
PORT=5000
MONGO_URI=<tu-uri-de-mongodb-atlas>
SUPABASE_URL=<tu-url-de-supabase>
SUPABASE_KEY=<tu-anon-key-de-supabase>
JWT_SECRET=<secreto-para-jwt>
```

### 3. Configurar el frontend

```bash
cd frontend
npm install
```

Variables de entorno en `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Ejecutar en desarrollo

Desde la raíz del proyecto:

```bash
# Backend (con hot-reload)
npm run dev:backend

# Frontend (en otra terminal)
npm run start:frontend
```

O desde cada carpeta:

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm start
```

### 5. Poblar la base de datos (opcional)

```bash
cd backend
npm run seed:all       # Seed completo
npm run seed:users     # Solo usuarios
npm run seed:sports    # Solo retos
npm run seed:participations  # Solo participaciones
```

## Deploy en producción

El proyecto está desplegado en [Render](https://render.com):

- **Frontend:** https://daydare.onrender.com
- **Backend:** https://ua-5fnr.onrender.com

Para producción, el frontend usa `frontend/.env.production`:

```env
REACT_APP_API_URL=https://ua-5fnr.onrender.com
```

Construir el frontend para producción:

```bash
npm run build
```

## Scripts disponibles (raíz)

| Script | Descripción |
|--------|-------------|
| `npm run build` | Instala deps del frontend y genera build de producción |
| `npm run start:frontend` | Inicia el frontend en modo desarrollo |
| `npm run start:backend` | Inicia el backend con node |
| `npm run dev:backend` | Inicia el backend con nodemon (hot-reload) |
| `npm run build:frontend` | Solo genera el build del frontend |
