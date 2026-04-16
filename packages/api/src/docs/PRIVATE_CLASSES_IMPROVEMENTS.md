# Mejoras Implementadas: Clases Privadas Simplificadas

## 📋 Resumen de Cambios

Se han implementado mejoras significativas para simplificar y mejorar el servicio de clases privadas, tanto para estudiantes como para instructores/administradores.

---

## ✅ Cambios en Modelos

### 1. **PrivatePlan** - Agregado Schedule
```typescript
schedule?: {
  days: number[];           // Días de la semana: 0=Domingo, 1=Lunes, ..., 6=Sábado
  start_time: string;       // Formato: "HH:mm" (ej: "18:00")
  duration_minutes: number; // Duración de cada sesión
}
```

**Ejemplo:**
```json
{
  "name": "Pack 5 Sesiones",
  "sessionsTotal": 5,
  "priceCents": 120000,
  "schedule": {
    "days": [1, 3, 5],      // Lunes, Miércoles, Viernes
    "start_time": "18:00",
    "duration_minutes": 60
  }
}
```

### 2. **PrivatePlanEnrollment** - Agregado Expiration
```typescript
expires_at?: Date; // Fecha de vencimiento del plan
```

---

## 🎓 Endpoints para Estudiantes

### **GET /api/me/private/plan**
Obtiene el plan privado activo del estudiante autenticado.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "id": "...",
      "sessions_remaining": 3,
      "status": "active",
      "started_at": "2026-01-15T00:00:00Z",
      "expires_at": "2026-04-15T00:00:00Z",
      "agreed_price_cents": 110000
    },
    "plan": {
      "id": "...",
      "name": "Pack 5 Sesiones",
      "sessions_total": 5,
      "price_cents": 120000,
      "schedule": {
        "days": [1, 3, 5],
        "start_time": "18:00",
        "duration_minutes": 60
      }
    },
    "instructor": {
      "id": "...",
      "name": "Juan Pérez",
      "email": "juan@example.com"
    }
  }
}
```

**Información proporcionada:**
- ✅ Detalle del plan (precios, días, horas)
- ✅ Cuándo vence el plan privado (`expires_at`)
- ✅ Status del plan
- ✅ Schedule de las clases
- ✅ Nombre del instructor

### **GET /api/me/private/sessions**
Obtiene las sesiones privadas del estudiante.

**Query Params:**
- `status`: Filtrar por estado (scheduled, completed, cancelled, no_show)
- `limit`: Límite de resultados (default: 50)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "startAt": "2026-01-20T18:00:00Z",
      "status": "scheduled",
      "price_cents": null,
      "instructor": {
        "id": "...",
        "name": "Juan Pérez",
        "email": "juan@example.com"
      }
    }
  ]
}
```

---

## 👨‍🏫 Endpoints para Instructores/Administradores

### **GET /api/me/private/students**
Lista todos los estudiantes con planes privados del instructor.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "María García",
      "email": "maria@example.com",
      "phone": "+1234567890",
      "rank": "Blue",
      "stripes": 2,
      "enrollments": [
        {
          "id": "...",
          "plan": {
            "id": "...",
            "name": "Pack 5 Sesiones",
            "sessions_total": 5,
            "price_cents": 120000,
            "schedule": {
              "days": [1, 3, 5],
              "start_time": "18:00",
              "duration_minutes": 60
            }
          },
          "sessions_remaining": 3,
          "status": "active",
          "started_at": "2026-01-15T00:00:00Z",
          "expires_at": "2026-04-15T00:00:00Z",
          "agreed_price_cents": 110000
        }
      ],
      "upcoming_sessions": [
        {
          "id": "...",
          "startAt": "2026-01-20T18:00:00Z",
          "status": "scheduled",
          "price_cents": null
        }
      ]
    }
  ]
}
```

**Información proporcionada:**
- ✅ Listado de alumnos con plan privado
- ✅ Detalle completo del alumno (nombre, email, teléfono, rango)
- ✅ Información de sus planes activos
- ✅ Próximas sesiones programadas

### **GET /api/me/private/students/:studentId**
Obtiene información detallada de un estudiante específico.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "...",
      "name": "María García",
      "email": "maria@example.com",
      "phone": "+1234567890",
      "rank": "Blue",
      "stripes": 2
    },
    "instructor": {
      "id": "...",
      "name": "Juan Pérez",
      "email": "juan@example.com"
    },
    "enrollments": [...],
    "sessions": [...]
  }
}
```

### **POST /api/me/private/plans** (Mejorado)
Crear plan con schedule.

**Body:**
```json
{
  "name": "Pack 5 Sesiones",
  "sessionsTotal": 5,
  "priceCents": 120000,
  "schedule": {
    "days": [1, 3, 5],
    "start_time": "18:00",
    "duration_minutes": 60
  }
}
```

**Validaciones:**
- `schedule.days`: Array no vacío, valores entre 0-6
- `schedule.start_time`: Formato HH:mm
- `schedule.duration_minutes`: Mínimo 1

### **POST /api/me/private/plans/:planId/enroll** (Mejorado)
Inscribir estudiante con fecha de vencimiento.

**Body:**
```json
{
  "studentId": "...",
  "agreedPriceCents": 110000,
  "expiresAt": "2026-04-15T00:00:00Z"  // Opcional
}
```

**Lógica:**
- Si `expiresAt` no se proporciona y el plan tiene `schedule`, se calcula automáticamente (3 meses desde `started_at`)
- Si el plan no tiene `schedule`, no se establece fecha de vencimiento

### **POST /api/me/private/students/:studentId/convert**
Convertir un estudiante regular a estudiante privado.

**Descripción:**
- Asigna el estudiante al instructor actual
- Permite pasar estudiantes de clases regulares a clases particulares
- Valida que el estudiante no pertenezca a otro instructor

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "María García",
    "email": "maria@example.com",
    "private_owner_instructor_id": "..."
  },
  "message": "Student successfully converted to private student"
}
```

---

## 📊 Comparación: Antes vs Después

### Antes
- ❌ No había información de schedule (días, horas)
- ❌ No había fecha de vencimiento
- ❌ Estudiantes no podían ver su plan
- ❌ Instructores no podían listar estudiantes fácilmente
- ❌ No había forma de convertir estudiantes regulares a privados

### Después
- ✅ Schedule completo (días, hora, duración)
- ✅ Fecha de vencimiento automática o manual
- ✅ Endpoints para estudiantes
- ✅ Listado completo de estudiantes con detalles
- ✅ Conversión de estudiantes regulares a privados

---

## 🔐 Seguridad

Todos los endpoints:
- ✅ Requieren autenticación (`isAuthenticated`)
- ✅ Validan roles apropiados:
  - Estudiantes: `requireRole('student')`
  - Instructores: `requireRole('instructor')` o `isAdmin()`
- ✅ Validan propiedad (estudiante pertenece al instructor)
- ✅ Validan datos de entrada

---

## 📝 Notas de Implementación

1. **Schedule es opcional**: Los planes pueden crearse con o sin schedule
2. **Expiration automática**: Si el plan tiene schedule y no se proporciona `expiresAt`, se calcula automáticamente (3 meses)
3. **Compatibilidad**: Los planes existentes sin schedule siguen funcionando
4. **Validaciones**: Todas las validaciones están implementadas en el backend

---

## 🎨 Frontend Implementado

### **Ruta: `/admin/private-classes`**
Página de gestión de clases privadas para administradores e instructores.

**Estructura:**
- **Página**: `packages/web/src/pages/private-classes.tsx`
- **Container**: `packages/web/src/containers/private-classes-container.tsx`
- **Vista Principal**: `packages/web/src/components/private-classes/private-classes-view.tsx`

**Componentes:**
- `PrivatePlansTab` - Gestión de planes privados
- `PrivateStudentsTab` - Listado de estudiantes con planes privados
- `PrivateSessionsTab` - Gestión de sesiones privadas

**Navegación:**
- ✅ Agregado al sidebar del dashboard con icono `GraduationCap`
- ✅ Ruta protegida con `AdminRoute` (requiere rol admin o instructor)
- ✅ Ubicación: `/admin/private-classes`

**API Clients:**
- `packages/web/src/api/private-plans.ts` - Cliente para planes privados
- `packages/web/src/api/private-students.ts` - Cliente para estudiantes privados
- `packages/web/src/api/private-sessions.ts` - Cliente para sesiones privadas

**Endpoints de Sesiones Privadas (`/api/me/private/sessions`):**
- ✅ `GET /sessions` - Listar todas las sesiones del instructor (con filtros opcionales: status, startDate, endDate, limit)
- ✅ `GET /sessions/:id` - Obtener detalles de una sesión específica
- ✅ `POST /sessions` - Crear una nueva sesión privada
- ✅ `POST /sessions/:id/checkin` - Hacer check-in de una sesión (marcar como completada y consumir créditos del plan)

---

## 🚀 Próximos Pasos Sugeridos

1. ✅ **Frontend**: UI básica implementada para instructores/admins
2. **Frontend Estudiantes**: Implementar UI para estudiantes (ver su plan y sesiones)
3. **Notificaciones**: Recordatorios de sesiones basados en schedule
4. **Reportes**: Estadísticas de uso de planes privados
5. **Calendario**: Vista de calendario para instructores con todas las sesiones
6. **Formularios**: Completar formularios de creación/edición de planes y sesiones
