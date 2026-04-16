# Configuración Centralizada de la API

Este documento explica el sistema de configuración centralizada de la API.

## 📋 Archivo de Configuración

Todas las variables de entorno, secrets, IDs y keys están centralizadas en:
```
packages/api/src/config/app.config.ts
```

## 🎯 Propósito

Este archivo centraliza todas las configuraciones para:
- **Facilitar el mantenimiento**: Un solo lugar para todas las configuraciones
- **Evitar duplicación**: No más `process.env` dispersos por el código
- **Type safety**: Configuraciones tipadas con TypeScript
- **Validación**: Validación automática de configuraciones críticas al inicio
- **Documentación**: Un solo lugar para ver todas las configuraciones necesarias

## 📦 Estructura de Configuración

### Server Configuration
```typescript
SERVER_CONFIG = {
  PORT: number,
  HOST: string,
  NODE_ENV: 'production' | 'development',
  FRONTEND_URL: string,
}
```

### Database Configuration
```typescript
DATABASE_CONFIG = {
  MONGODB_URI: string,
  DEBUG_DB_URI: boolean,
}
```

### JWT Configuration
```typescript
JWT_CONFIG = {
  SECRET: string,
  PRIVATE_KEY_PEM: string,
  PUBLIC_KEY_PEM: string,
  ACCESS_TTL: string,
  REFRESH_TTL: string,
}
```

### reCAPTCHA Configuration
```typescript
RECAPTCHA_CONFIG = {
  SECRET_KEY: string,
  VERIFY_URL: string,
  DEFAULT_THRESHOLD: number,
}
```

### Google OAuth Configuration
```typescript
GOOGLE_OAUTH_CONFIG = {
  CLIENT_ID: string,
  CLIENT_SECRET: string,
  REDIRECT_URI: string,
}
```

### Email Configuration
```typescript
EMAIL_CONFIG = {
  RESEND_API_KEY: string,
  FROM_EMAIL: string,
  APP_NAME: string,
  FRONTEND_URL: string,
}
```

### Cloudinary Configuration
```typescript
CLOUDINARY_CONFIG = {
  CLOUD_NAME: string,
  API_KEY: string,
  API_SECRET: string,
}
```

### Grok AI Configuration
```typescript
GROK_CONFIG = {
  API_KEY: string,
  MODEL: string,
}
```

### Admin Whitelist Configuration
```typescript
ADMIN_WHITELIST_CONFIG = {
  WHITELIST: string,
  WHITELIST_JSON: string,
}
```

### Feature Flags
```typescript
FEATURE_FLAGS = {
  ENABLE_SCHEDULERS: boolean,
}
```

## 🔧 Cómo Usar

### Importar Configuraciones

```typescript
// Importar configuraciones específicas
import { SERVER_CONFIG, isProduction } from '../config/app.config.js';
import { DATABASE_CONFIG } from '../config/app.config.js';
import { JWT_CONFIG } from '../config/app.config.js';
import { RECAPTCHA_CONFIG } from '../config/app.config.js';

// Usar las configuraciones
const port = SERVER_CONFIG.PORT;
const mongoUri = DATABASE_CONFIG.MONGODB_URI;
const jwtSecret = JWT_CONFIG.SECRET;
```

### Ejemplos de Uso

#### Antes (❌ No hacer)
```typescript
const port = process.env.PORT || 8080;
const mongoUri = process.env.MONGODB_URI;
const isProd = process.env.NODE_ENV === 'production';
```

#### Después (✅ Correcto)
```typescript
import { SERVER_CONFIG, isProduction, DATABASE_CONFIG } from '../config/app.config.js';

const port = SERVER_CONFIG.PORT;
const mongoUri = DATABASE_CONFIG.MONGODB_URI;
const isProd = isProduction;
```

## ✅ Validación Automática

El archivo `app.config.ts` incluye una función `validateConfig()` que:
- Valida que las configuraciones críticas estén presentes
- Muestra advertencias para configuraciones opcionales en producción
- Lanza errores si faltan configuraciones requeridas

Esta validación se ejecuta automáticamente al iniciar la aplicación en `index.ts`.

## 📝 Variables de Entorno Requeridas

### Producción (Requeridas)
- `MONGODB_URI` - URI de conexión a MongoDB
- `JWT_SECRET` o `JWT_PRIVATE_KEY_PEM` + `JWT_PUBLIC_KEY_PEM` - Configuración JWT
- `RECAPTCHA_SECRET_KEY` - Secret key de reCAPTCHA

### Producción (Opcionales pero Recomendadas)
- `GOOGLE_CLIENT_ID` - ID de cliente de Google OAuth
- `GOOGLE_CLIENT_SECRET` - Secret de cliente de Google OAuth
- `RESEND_API_KEY` - API key de Resend para emails
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Configuración de Cloudinary

### Desarrollo
- Todas las variables tienen valores por defecto para desarrollo local
- `MONGODB_URI` por defecto: `mongodb://localhost:27017/pantera-negra`
- `FRONTEND_URL` por defecto: `http://localhost:5173`
- `PORT` por defecto: `8080`

## 🔄 Migración

Si encuentras código que aún usa `process.env` directamente:

1. **Identifica la configuración**: ¿Qué variable de entorno se está usando?
2. **Importa la configuración**: Importa el objeto de configuración correspondiente desde `app.config.ts`
3. **Reemplaza el uso**: Reemplaza `process.env.VARIABLE` con `CONFIG_OBJECT.VARIABLE`

### Ejemplo de Migración

```typescript
// Antes
const apiKey = process.env.RESEND_API_KEY || '';

// Después
import { EMAIL_CONFIG } from '../config/app.config.js';
const apiKey = EMAIL_CONFIG.RESEND_API_KEY;
```

## 🚫 Reglas

1. **NO uses `process.env` directamente** en ningún archivo excepto `app.config.ts`
2. **Siempre importa** las configuraciones desde `app.config.ts`
3. **Usa las constantes exportadas** como `isProduction`, `isDevelopment` en lugar de verificar `NODE_ENV`
4. **Agrega nuevas configuraciones** a `app.config.ts` si necesitas nuevas variables de entorno

## 📚 Referencias

- [Configuración de la API](./API_CONFIG_README.md)
- [Configuración de reCAPTCHA](./RECAPTCHA_SETUP.md)

