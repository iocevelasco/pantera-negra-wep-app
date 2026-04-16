# Configuración de Notificaciones Push

Este documento explica cómo configurar y usar el sistema de notificaciones push en Pantera Negra.

## Requisitos Previos

- Node.js instalado
- MongoDB en ejecución
- Navegador que soporte Service Workers y Push API (Chrome, Firefox, Edge, Safari 16+)

## Instalación

### 1. Instalar dependencias

```bash
cd packages/api
pnpm install web-push
```

### 2. Generar VAPID Keys

Las VAPID keys son necesarias para autenticar las notificaciones push. Genera las keys usando el script:

```bash
cd packages/api
pnpm generate:vapid-keys
```

Esto generará un par de keys (pública y privada). Copia las keys generadas.

### 3. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env` en `packages/api`:

```env
VAPID_PUBLIC_KEY=tu_public_key_aqui
VAPID_PRIVATE_KEY=tu_private_key_aqui
VAPID_SUBJECT=http://localhost:5173  # URL de tu frontend
```

**⚠️ IMPORTANTE:** Nunca compartas ni commitees la `VAPID_PRIVATE_KEY` a un repositorio público.

## Flujo de Funcionamiento

1. **Usuario acepta notificaciones en el navegador**
   - El navegador solicita permiso al usuario
   - El usuario puede aceptar o rechazar

2. **React registra un Service Worker**
   - El Service Worker se registra automáticamente al cargar la aplicación
   - Se encuentra en `packages/web/public/sw.js`

3. **El navegador genera una subscription**
   - Cuando el usuario acepta, se crea una Push Subscription
   - La subscription contiene un endpoint único y keys de encriptación

4. **React envía la subscription al backend**
   - Se envía a `POST /api/notifications/subscribe`
   - Se guarda asociada al usuario autenticado

5. **Node guarda la subscription**
   - Se almacena en MongoDB en la colección `pushsubscriptions`
   - Incluye el `user_id`, `endpoint`, y `keys`

6. **Node envía notificaciones push cuando sea necesario**
   - Usa el servicio `PushNotificationService`
   - Las notificaciones se envían usando el protocolo Web Push

7. **El navegador muestra las notificaciones**
   - Incluso con la app cerrada
   - El Service Worker maneja el evento `push` y muestra la notificación

## Uso en el Frontend

### Hook `usePushNotifications`

El hook `usePushNotifications` proporciona toda la funcionalidad necesaria:

```tsx
import { usePushNotifications } from '@/hooks/notifications/use-push-notifications';

function MyComponent() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    permission,
  } = usePushNotifications();

  return (
    <button onClick={subscribe} disabled={isSubscribed || isLoading}>
      {isSubscribed ? 'Desactivar' : 'Activar'} Notificaciones
    </button>
  );
}
```

### Componente `PushNotificationToggle`

Ya está integrado en el perfil del estudiante (`StudentProfile`). También puedes usarlo en otros lugares:

```tsx
import { PushNotificationToggle } from '@/components/notifications/push-notification-toggle';

<PushNotificationToggle />
```

## Uso en el Backend

### Enviar Notificación a un Usuario

```typescript
import { PushNotificationService } from './services/push-notification.service';

// Enviar a un usuario específico
await PushNotificationService.sendToUser(
  userId,
  {
    title: 'Nueva clase disponible',
    body: 'Hay una nueva clase disponible para ti',
    icon: '/logo.png',
    data: { url: '/classes' },
  }
);
```

### Enviar Notificación a Múltiples Usuarios

```typescript
await PushNotificationService.sendToUsers(
  [userId1, userId2, userId3],
  {
    title: 'Recordatorio',
    body: 'No olvides asistir a tu clase hoy',
  }
);
```

### Enviar Notificación a Todos

```typescript
await PushNotificationService.sendToAll({
  title: 'Anuncio',
  body: 'Nuevo horario de clases disponible',
});
```

### API Endpoints

#### `GET /api/notifications/vapid-public-key`
Obtiene la clave pública VAPID para suscribirse.

#### `POST /api/notifications/subscribe`
Suscribe al usuario autenticado a las notificaciones push.
Requiere autenticación.

**Body:**
```json
{
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "userAgent": "Mozilla/5.0..."
}
```

#### `POST /api/notifications/unsubscribe`
Cancela la suscripción del usuario.
Requiere autenticación.

**Body:**
```json
{
  "endpoint": "https://..."
}
```

#### `GET /api/notifications/subscriptions`
Obtiene todas las suscripciones del usuario autenticado.
Requiere autenticación.

#### `POST /api/notifications/send`
Envía una notificación push (solo administradores).
Requiere autenticación y rol de admin.

**Body:**
```json
{
  "payload": {
    "title": "Título",
    "body": "Cuerpo del mensaje",
    "icon": "/logo.png",
    "data": { "url": "/" }
  },
  "userIds": ["userId1", "userId2"] // Opcional, si no se envía, se envía a todos
}
```

## Testing

### Probar Notificaciones Localmente

1. Asegúrate de que el backend esté corriendo
2. Asegúrate de que el frontend esté corriendo
3. Abre la aplicación en el navegador
4. Ve al perfil del estudiante
5. Haz clic en "Activar notificaciones"
6. Acepta el permiso cuando el navegador lo solicite
7. Usa la API o el servicio para enviar una notificación de prueba

### Enviar Notificación de Prueba desde el Backend

Puedes crear un script temporal o usar el endpoint de admin:

```typescript
// En algún servicio o script
import { PushNotificationService } from './services/push-notification.service';

// Obtener un userId de prueba
const userId = new mongoose.Types.ObjectId('...');

await PushNotificationService.sendToUser(userId, {
  title: 'Prueba',
  body: 'Esta es una notificación de prueba',
  icon: '/logo.png',
});
```

## Troubleshooting

### Las notificaciones no se muestran

1. Verifica que el Service Worker esté registrado:
   - Abre DevTools > Application > Service Workers
   - Debe aparecer `/sw.js` como activo

2. Verifica que las VAPID keys estén configuradas:
   - Revisa las variables de entorno
   - Verifica que el endpoint `/api/notifications/vapid-public-key` devuelva la clave

3. Verifica los permisos del navegador:
   - DevTools > Application > Notifications
   - Debe estar en "Allow"

4. Revisa la consola del navegador y del servidor para errores

### Error: "VAPID keys not configured"

Asegúrate de que las variables `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` estén en tu `.env`.

### Error: "Service Worker registration failed"

- Verifica que `sw.js` esté en la carpeta `public/`
- Verifica que la aplicación se esté sirviendo por HTTPS (requerido en producción)
- En desarrollo, localhost funciona sin HTTPS

### Las notificaciones no funcionan en producción

Las notificaciones push requieren HTTPS en producción. Asegúrate de:
- Tener un certificado SSL válido
- Que el Service Worker se sirva correctamente
- Que las VAPID keys estén configuradas en el servidor de producción

## Seguridad

- **Nunca** compartas la `VAPID_PRIVATE_KEY`
- Las suscripciones están asociadas a usuarios autenticados
- Solo los administradores pueden enviar notificaciones manualmente
- Las notificaciones se envían de forma segura usando el protocolo Web Push

## Recursos

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push library](https://github.com/web-push-libs/web-push)

