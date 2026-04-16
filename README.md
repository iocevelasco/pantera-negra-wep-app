# Pantera Negra - Monorepo

Aplicación de gestión para gimnasios de artes marciales, migrada de Next.js a un monorepo con Vite + Express.

## 📚 Documentación

**Toda la documentación del proyecto está centralizada en [`packages/shared/docs/`](./packages/shared/docs/).**

Para acceder a la documentación completa, consulta:
- **[Índice de Documentación](./packages/shared/docs/INDEX.md)** - Índice completo de toda la documentación
- **[README Principal](./packages/shared/docs/README.md)** - Documentación principal del proyecto

## 🚀 Inicio Rápido

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

## 📦 Estructura del Proyecto

```
pantera-negra-monorepo/
├── packages/
│   ├── web/          # Frontend (Vite + React + TypeScript)
│   ├── api/          # Backend (Express + MongoDB + TypeScript)
│   └── shared/       # Tipos, schemas y documentación compartidos
│       └── docs/     # 📚 Documentación del proyecto
├── .github/
│   └── workflows/    # CI/CD con GitHub Actions
```

## 📖 Documentación Disponible

- **[README Principal](./packages/shared/docs/README.md)** - Guía completa del proyecto
- **[Configuración de reCAPTCHA](./packages/shared/docs/RECAPTCHA_SETUP.md)** - Setup de reCAPTCHA v3
- **[Análisis de Registro](./packages/shared/docs/REGISTRO_USUARIO_ANALISIS.md)** - Flujo de registro de usuarios
- **[Recomendaciones de Check-in](./packages/shared/docs/ATTENDANCE_CHECKIN_RECOMMENDATIONS.md)** - Sistema de asistencia
- **[Características](./packages/shared/docs/FEATURES.md)** - Lista de funcionalidades
- **[Configuración de API](./packages/shared/docs/API_CONFIG_README.md)** - Setup del backend
- **[Internacionalización](./packages/shared/docs/I18N_README.md)** - Sistema i18n

Ver el [índice completo](./packages/shared/docs/INDEX.md) para más información.

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
```

## 📝 Notas

- La documentación está centralizada en `packages/shared/docs/` para facilitar su mantenimiento
- Todos los archivos de documentación están en formato Markdown
- Consulta el [índice de documentación](./packages/shared/docs/INDEX.md) para navegar por toda la documentación disponible

---

**Desarrollado con ❤️ para Pantera Negra**

