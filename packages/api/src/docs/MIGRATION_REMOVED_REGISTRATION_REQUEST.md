# Migración: Eliminación de RegistrationRequest

## ✅ Cambios Realizados

### 1. **Modelo RegistrationRequest Eliminado**
- ❌ Eliminado: `packages/api/src/models/RegistrationRequest.ts`
- ✅ Razón: No se usaba en el backend, duplicaba campos de `User`

### 2. **Mejoras en User.registration**
- ✅ `registration.status` ahora es `required: true`
- ✅ Validación mejorada en pre-validate hook:
  - `requestedAt` se establece automáticamente si falta cuando status es 'pending'
  - `confirmedAt` se establece automáticamente cuando status es 'confirmed'
  - `rejectedAt` se establece automáticamente cuando status es 'rejected'

### 3. **Estructura Final de User.registration**
```typescript
registration: {
  status: 'pending' | 'confirmed' | 'rejected'; // REQUIRED
  requestedAt: Date;                           // Auto-set if pending
  requestedIp?: string;
  confirmedAt?: Date;                          // Auto-set if confirmed
  confirmedBy?: ObjectId;
  rejectedAt?: Date;                           // Auto-set if rejected
  rejectedBy?: ObjectId;
  rejectionReason?: string;
}
```

## 📋 Verificación

### Backend
- ✅ No hay referencias a `RegistrationRequestModel` en el código
- ✅ Todas las rutas usan `User.registration` embebido
- ✅ Validaciones mejoradas en el modelo User

### Frontend (No Cambiado - Documentación)
El frontend en `packages/web/src/api/registrations.ts` define:
```typescript
export interface RegistrationRequest {
  // ... campos de User con registration embebido
  registration: {
    status: 'pending' | 'confirmed' | 'rejected';
    // ...
  };
}
```

**Nota:** Esta interfaz está correcta porque el backend devuelve `User` con `registration` embebido, no un modelo separado.

## 🔄 Si Necesitas Migrar Datos Existentes

Si existían documentos en la colección `RegistrationRequest` (poco probable ya que no se usaba):

```javascript
// Script de migración (si es necesario)
const RegistrationRequestModel = mongoose.model('RegistrationRequest', ...);
const UserModel = mongoose.model('User', ...);

const requests = await RegistrationRequestModel.find({ status: 'pending' });

for (const request of requests) {
  const user = await UserModel.findOne({ email: request.email });
  if (!user) {
    // Crear usuario desde request
    await UserModel.create({
      email: request.email,
      name: request.name,
      password: request.password,
      tenant_id: request.tenant_id,
      rank: request.rank,
      stripes: request.stripes,
      roles: ['student'],
      registration: {
        status: request.status,
        requestedAt: request.requestedAt,
        requestedIp: request.requestedIp,
        // ...
      },
    });
  }
}
```

## ✅ Estado Final

- ✅ Modelo duplicado eliminado
- ✅ Validaciones mejoradas
- ✅ Código más simple y mantenible
- ✅ Sin duplicación de datos
- ✅ Frontend compatible (ya usaba User.registration)
