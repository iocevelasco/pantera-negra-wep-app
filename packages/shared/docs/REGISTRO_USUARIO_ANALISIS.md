# Análisis: Proceso de Registro de Usuario

## Estado Actual de la API

### Endpoints Existentes
1. **POST /api/users** - Crea usuarios (requiere autenticación/admin)
   - ❌ NO acepta campo `password`
   - ✅ Crea usuario con email, name, role, tenant_id, etc.
   - ✅ Valida unicidad de email
   - ✅ Crea membership si se proporciona plan

2. **POST /api/auth/login** - Login con email/password
   - ✅ Valida email y password
   - ✅ Genera tokens JWT
   - ✅ Maneja refresh tokens en cookies

3. **GET /api/auth/google** - OAuth con Google
   - ✅ Crea usuarios automáticamente si no existen
   - ✅ Genera tokens después del login

### Modelo User.ts
```typescript
- email: required, unique, lowercase, trim
- password: optional, select: false (oculto por defecto)
- email_verified: boolean, default: false
- name: optional
- tenant_id: required (ObjectId)
- role: enum ['admin', 'instructor', 'alumno', 'owner'], default: 'alumno'
- rank: enum ['White', 'Blue', 'Purple', 'Brown', 'Black'], default: 'White'
- stripes: number, min: 0, max: 4, default: 0
```

## Pasos Necesarios para el Proceso de Registro

### 1. Validación de Datos de Entrada
- ✅ **Email**: 
  - Formato válido (regex)
  - Normalización (lowercase, trim)
  - Verificar unicidad en base de datos
- ✅ **Password**:
  - Longitud mínima (8 caracteres recomendado)
  - Opcionalmente: mayúsculas, números, caracteres especiales
  - Hash con bcrypt antes de guardar
- ✅ **Name**: Opcional pero recomendado
- ✅ **Tenant**: Resolver desde header, query param, o usar default

### 2. Seguridad
- ✅ **Rate Limiting**: Ya implementado en auth.ts (10 requests/15min)
- ✅ **Password Hashing**: Usar bcrypt (ya usado en el código)
- ✅ **HTTPS**: Asegurar en producción
- ✅ **Validación de Email**: Verificar formato antes de guardar

### 3. Flujo del Registro
1. Validar datos de entrada (email, password, name)
2. Verificar que el email no exista
3. Resolver tenant (desde header, query, o default)
4. Hash de password con bcrypt
5. Crear usuario en base de datos
6. Asignar role por defecto ('alumno')
7. Generar tokens JWT (access + refresh)
8. Retornar tokens y datos del usuario
9. Opcional: Enviar email de verificación

### 4. Respuesta del Endpoint
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "jwt_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "alumno",
      "tenant_id": "tenant_id"
    }
  }
}
```

### 5. Manejo de Errores
- Email ya existe → 400 Bad Request
- Email inválido → 400 Bad Request
- Password débil → 400 Bad Request
- Tenant no encontrado → 400 Bad Request
- Error de base de datos → 500 Internal Server Error

## Comparación con Otras Aplicaciones

### Patrones Comunes de Registro

1. **Registro Simple (Email + Password)**
   - Validación básica
   - Hash de password
   - Creación de usuario
   - Auto-login opcional

2. **Registro con Verificación de Email**
   - Crear usuario con `email_verified: false`
   - Enviar email con token de verificación
   - Endpoint para verificar email

3. **Registro con Multi-tenant**
   - Resolver tenant desde subdomain/header
   - Asignar usuario al tenant correcto

4. **Registro con Roles**
   - Asignar role por defecto ('alumno')
   - Admin puede cambiar roles después

## Recomendaciones de Implementación

### Endpoint Propuesto: POST /api/auth/register

**Ventajas:**
- Separación clara entre registro público y creación admin
- Rate limiting ya configurado en auth router
- Reutiliza servicios existentes (AuthService, JWTService)
- Consistente con el patrón de /api/auth/*

**Campos Requeridos:**
- `email` (string, required)
- `password` (string, required, min 8 caracteres)
- `name` (string, optional)

**Campos Opcionales:**
- `tenant_id` (string, opcional - se resuelve automáticamente si no se proporciona)
- `rank` (string, opcional, default: 'White')
- `stripes` (number, opcional, default: 0)

**Validaciones:**
1. Email válido y único
2. Password mínimo 8 caracteres
3. Tenant válido (si se proporciona)
4. Rate limiting (10 requests/15min)

**Flujo:**
1. Validar y normalizar email
2. Verificar unicidad
3. Validar password
4. Resolver tenant
5. Hash password
6. Crear usuario
7. Generar tokens
8. Retornar respuesta

## Consideraciones Adicionales

### Verificación de Email (Futuro)
- Implementar sistema de tokens de verificación
- Endpoint POST /api/auth/verify-email
- Actualizar `email_verified` después de verificación

### Recuperación de Contraseña (Futuro)
- Endpoint POST /api/auth/forgot-password
- Generar token de reset
- Endpoint POST /api/auth/reset-password

### Mejoras de Seguridad
- Validación de fortaleza de password más estricta
- CAPTCHA para prevenir bots
- Logging de intentos de registro
- Blacklist de emails temporales

---

## Implementación Realizada

### Backend - Endpoint de Registro

**Archivo:** `packages/api/src/routes/auth.ts`

**Endpoint:** `POST /api/auth/register`

**Características implementadas:**
- ✅ Validación de email (formato y unicidad)
- ✅ Validación de password (mínimo 8 caracteres)
- ✅ Hash de password con bcrypt
- ✅ Resolución automática de tenant (header, body, o default)
- ✅ Creación de usuario con role 'alumno' por defecto
- ✅ Generación de tokens JWT (access + refresh)
- ✅ Rate limiting (10 requests/15min)
- ✅ Manejo de errores apropiado
- ✅ Logging detallado para debugging

**Campos aceptados:**
- `email` (required): Email del usuario
- `password` (required): Contraseña (mínimo 8 caracteres)
- `name` (optional): Nombre del usuario
- `tenant_id` (optional): ID del tenant (se resuelve automáticamente si no se proporciona)
- `rank` (optional): Rango BJJ (default: 'White')
- `stripes` (optional): Número de rayas (default: 0)

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "jwt_token",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "alumno",
      "tenant_id": "tenant_id",
      "email_verified": false
    }
  }
}
```

### Frontend - Integración

**Archivos modificados:**
1. `packages/web/src/api/auth.ts`
   - ✅ Agregada interfaz `RegisterCredentials`
   - ✅ Agregado método `register()` en `authApi`

2. `packages/web/src/hooks/auth/use-auth.ts`
   - ✅ Agregado hook `useRegister()` para usar en componentes
   - ✅ Manejo de redirección después del registro
   - ✅ Integración con AuthProvider y UserStore

**Uso en componentes:**
```typescript
import { useRegister } from '@/hooks/auth/use-auth';

function RegisterComponent() {
  const registerMutation = useRegister();
  
  const handleSubmit = (data: RegisterCredentials) => {
    registerMutation.mutate({
      email: data.email,
      password: data.password,
      name: data.name,
    });
  };
  
  // ...
}
```

### Ejemplo de Uso Completo

**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "nuevo@usuario.com",
  "password": "miPassword123",
  "name": "Nuevo Usuario"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "nuevo@usuario.com",
      "name": "Nuevo Usuario",
      "role": "alumno",
      "tenant_id": "507f1f77bcf86cd799439012",
      "email_verified": false
    }
  }
}
```

### Próximos Pasos Recomendados

1. **Crear página de registro en el frontend**
   - Formulario con validación
   - Integración con `useRegister` hook
   - Manejo de errores y mensajes de éxito

2. **Mejorar validación de password**
   - Requerir mayúsculas, números, caracteres especiales
   - Mostrar fortaleza de password en tiempo real

3. **Implementar verificación de email**
   - Enviar email de verificación después del registro
   - Endpoint para verificar token de email

4. **Agregar tests**
   - Tests unitarios para el endpoint de registro
   - Tests de integración para el flujo completo

