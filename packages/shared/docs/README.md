# Pantera Negra - Monorepo

Aplicación de gestión para gimnasios de artes marciales, migrada de Next.js a un monorepo con Vite + Express.

## 🏗️ Estructura del Monorepo

```
pantera-negra-monorepo/
├── packages/
│   ├── web/          # Frontend (Vite + React + TypeScript)
│   ├── api/          # Backend (Express + MongoDB + TypeScript)
│   └── shared/       # Tipos, schemas y documentación compartidos
│       └── docs/     # Documentación del proyecto (ver INDEX.md)
├── .github/
│   └── workflows/    # CI/CD con GitHub Actions
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20+
- pnpm 9+
- MongoDB (local o Atlas)

### Instalación

```bash
# Instalar dependencias
pnpm install

# Desarrollo (frontend + backend)
pnpm dev

# Solo frontend
pnpm dev:web

# Solo backend
pnpm dev:api
```

### Build

```bash
# Build todo
pnpm build

# Build específico
pnpm build:web
pnpm build:api
```

## 📦 Paquetes

### `packages/web` - Frontend

- **Stack**: React 19 + Vite + TypeScript + Tailwind CSS
- **UI**: shadcn/ui
- **Routing**: React Router
- **Puerto**: 5173 (dev)

### `packages/api` - Backend

- **Stack**: Express + TypeScript + MongoDB (Mongoose)
- **Validación**: Zod
- **Puerto**: 3001 (dev)

### `packages/shared` - Shared

- Tipos TypeScript compartidos
- Schemas de validación Zod

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Frontend + Backend
pnpm dev:web          # Solo frontend
pnpm dev:api          # Solo backend

# Build
pnpm build            # Todo
pnpm build:web        # Solo frontend
pnpm build:api        # Solo backend

# Calidad
pnpm lint             # Lint todos los paquetes
pnpm typecheck        # Type check todos los paquetes
pnpm test             # Tests todos los paquetes

# Limpieza
pnpm clean            # Limpia todos los builds
```

## 🌐 Despliegue

El despliegue se puede realizar manualmente o configurando CI/CD según tus necesidades.

### Build para Producción

```bash
# Build completo
pnpm build

# Build específico
pnpm build:web
pnpm build:api
```

Los archivos de build estarán en:
- Frontend: `packages/web/dist`
- Backend: `packages/api/dist`

## 📚 Documentación

Toda la documentación del proyecto está centralizada en `packages/shared/docs/`:

- **[INDEX.md](./INDEX.md)** - Índice completo de toda la documentación
- **[RECAPTCHA_SETUP.md](./RECAPTCHA_SETUP.md)** - Configuración de reCAPTCHA v3
- **[REGISTRO_USUARIO_ANALISIS.md](./REGISTRO_USUARIO_ANALISIS.md)** - Análisis del flujo de registro
- **[ATTENDANCE_CHECKIN_RECOMMENDATIONS.md](./ATTENDANCE_CHECKIN_RECOMMENDATIONS.md)** - Recomendaciones de check-in
- **[FEATURES.md](./FEATURES.md)** - Características del proyecto
- **[API_CONFIG_README.md](./API_CONFIG_README.md)** - Configuración de la API
- **[I18N_README.md](./I18N_README.md)** - Sistema de internacionalización

Ver [INDEX.md](./INDEX.md) para el índice completo.

## 🔧 Configuración

### Variables de Entorno

#### Backend (`packages/api/.env`)

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pantera-negra
FRONTEND_URL=http://localhost:5173
RECAPTCHA_SECRET_KEY=tu_reCAPTCHA_secret_key_aqui
```

#### Frontend (`packages/web/.env`)

```env
VITE_API_URL=http://localhost:3001
VITE_RECAPTCHA_SITE_KEY=tu_reCAPTCHA_site_key_aqui
```

#### Backend (`packages/api/.env`)

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pantera-negra
FRONTEND_URL=http://localhost:5173
RECAPTCHA_SECRET_KEY=tu_reCAPTCHA_secret_key_aqui
```

## 🧪 Testing

```bash
# Tests (cuando estén configurados)
pnpm test

# Tests específicos
pnpm --filter api test
pnpm --filter web test
```

## 📝 Licencia

Privado - Todos los derechos reservados

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte, abre un issue en el repositorio.

---

**Desarrollado con ❤️ para Pantera Negra**

Deploy
--flyctl deploy --buildkit --remote-only 