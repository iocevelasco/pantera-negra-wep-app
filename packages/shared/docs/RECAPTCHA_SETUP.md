# Configuración de reCAPTCHA v3

Este documento explica cómo configurar reCAPTCHA v3 en la aplicación Pantera Negra.

## ¿Qué es reCAPTCHA v3?

reCAPTCHA v3 es un servicio de Google que protege tu sitio web de bots y abusos sin interrumpir la experiencia del usuario. A diferencia de reCAPTCHA v2, no muestra desafíos visuales. En su lugar, analiza el comportamiento del usuario y proporciona una puntuación (0.0 a 1.0) que indica qué tan probable es que sea un humano.

- **1.0**: Muy probable que sea una interacción legítima
- **0.0**: Muy probable que sea un bot

## Pasos para Configurar

### 1. Obtener las Claves de reCAPTCHA

1. Ve a [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Haz clic en "Create" para crear un nuevo sitio
3. Selecciona **reCAPTCHA v3**
4. Agrega tu dominio (ej: `localhost` para desarrollo, `pantera-negra-wep-app.fly.dev` para producción)
5. Acepta los términos y condiciones
6. Copia las dos claves:
   - **Site Key** (clave pública) - se usa en el frontend
   - **Secret Key** (clave privada) - se usa en el backend

### 2. Configurar Variables de Entorno

#### Frontend (`packages/web/.env` o variables de entorno de producción)

```env
VITE_RECAPTCHA_SITE_KEY=tu_site_key_aqui
```

#### Backend (`packages/api/.env` o variables de entorno de producción)

```env
RECAPTCHA_SECRET_KEY=tu_secret_key_aqui
```

### 3. Configurar Dominios Permitidos

En la consola de administración de reCAPTCHA, asegúrate de agregar todos los dominios donde se usará:

- **Desarrollo**: `localhost`, `127.0.0.1`
- **Producción**: Tu dominio de producción (ej: `pantera-negra-wep-app.fly.dev`)

## Cómo Funciona

### Frontend

1. El script de reCAPTCHA se carga automáticamente cuando se necesita
2. Cuando el usuario envía un formulario (login, registro), se ejecuta reCAPTCHA
3. Se genera un token que se envía al backend junto con los datos del formulario

### Backend

1. El backend recibe el token de reCAPTCHA
2. Verifica el token con la API de Google
3. Obtiene una puntuación (score) y verifica que sea mayor al umbral (0.5 por defecto)
4. Si la verificación falla, se rechaza la solicitud

## Acciones Configuradas

Las siguientes acciones están protegidas con reCAPTCHA:

- **login**: Cuando un usuario inicia sesión
- **register**: Cuando un usuario se registra

## Umbral de Puntuación

Por defecto, el umbral es **0.5**. Esto significa que:
- Puntuaciones >= 0.5: Se acepta la solicitud
- Puntuaciones < 0.5: Se rechaza la solicitud

Puedes ajustar este umbral en `packages/api/src/services/recaptcha.service.ts` según tus necesidades:

```typescript
// Para ser más estricto (solo aceptar puntuaciones altas)
await verifyRecaptchaFromRequest(req, 'login', 0.7);

// Para ser más permisivo (aceptar puntuaciones más bajas)
await verifyRecaptchaFromRequest(req, 'login', 0.3);
```

## Recomendaciones

1. **Monitoreo**: Revisa regularmente el [Admin Console de reCAPTCHA](https://www.google.com/recaptcha/admin) para ver las estadísticas de tráfico
2. **Ajuste de Umbral**: Después de implementar, observa las puntuaciones en producción y ajusta el umbral según sea necesario
3. **Acciones Específicas**: Usa nombres de acción descriptivos (como 'login', 'register') para tener mejor visibilidad en el Admin Console
4. **Pruebas**: En desarrollo, reCAPTCHA puede dar puntuaciones diferentes. Esto es normal y se ajustará con el tráfico real

## Comportamiento en Desarrollo vs Producción

**reCAPTCHA está automáticamente deshabilitado en desarrollo:**

- ✅ **Desarrollo (localhost)**: reCAPTCHA está deshabilitado automáticamente
  - No se ejecuta en el frontend
  - No se verifica en el backend
  - No se requieren tokens
  - Los formularios funcionan normalmente

- ✅ **Producción**: reCAPTCHA está habilitado y es requerido
  - Se ejecuta en el frontend
  - Se verifica en el backend
  - Los tokens son obligatorios
  - Las claves deben estar configuradas

**Detección automática:**
- Frontend detecta `localhost`, `127.0.0.1` o IPs locales (`192.168.x.x`)
- Backend detecta `NODE_ENV !== 'production'`

No necesitas hacer nada especial para desarrollo - simplemente funciona sin reCAPTCHA.

## Solución de Problemas

### Error: "reCAPTCHA token is required"

- Verifica que `VITE_RECAPTCHA_SITE_KEY` esté configurado en el frontend
- Verifica que el script de reCAPTCHA se esté cargando correctamente (revisa la consola del navegador)
- Revisa los logs del frontend para ver si hay errores al cargar el script

### Error: "browser-error" (Error más común)

Este error generalmente ocurre cuando el dominio no está configurado correctamente en la consola de reCAPTCHA.

**Solución:**

1. **Verifica los dominios en la consola de reCAPTCHA:**
   - Ve a [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
   - Selecciona tu sitio
   - En la sección "Domains", asegúrate de tener:
     - `localhost` (para desarrollo)
     - `127.0.0.1` (alternativa para desarrollo)
     - Tu dominio de producción (ej: `pantera-negra-wep-app.fly.dev`)

2. **Verifica que las claves coincidan:**
   - La `VITE_RECAPTCHA_SITE_KEY` del frontend debe corresponder al mismo sitio que la `RECAPTCHA_SECRET_KEY` del backend
   - Ambas claves deben ser del mismo sitio de reCAPTCHA

3. **Verifica el hostname:**
   - Revisa los logs del backend cuando ocurre el error
   - El log mostrará el `hostname` que Google detectó
   - Asegúrate de que ese hostname esté en la lista de dominios permitidos

4. **Para desarrollo local:**
   - Si estás usando `localhost:5173`, agrega `localhost` a los dominios
   - Si estás usando `127.0.0.1:5173`, agrega `127.0.0.1` a los dominios
   - Puedes agregar ambos para mayor compatibilidad

### Error: "reCAPTCHA verification failed"

- Verifica que `RECAPTCHA_SECRET_KEY` esté configurado en el backend
- Verifica que el dominio esté agregado en la consola de administración de reCAPTCHA
- Verifica que las claves correspondan (site key y secret key del mismo sitio)

### Error: "invalid-input-response" con hostname "unknown" o "undefined"

Este es el error más común en producción. Ocurre cuando Google no puede determinar el dominio desde el cual se generó el token.

**Causas comunes:**

1. **Site key y Secret key no coinciden** (más común)
   - El `VITE_RECAPTCHA_SITE_KEY` del frontend y el `RECAPTCHA_SECRET_KEY` del backend deben ser del mismo sitio de reCAPTCHA
   - Verifica en [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin) que ambas claves pertenezcan al mismo sitio

2. **Dominio no configurado correctamente**
   - El dominio debe estar agregado exactamente como aparece en la URL (sin protocolo, sin puerto)
   - Ejemplo: `pantera-negra-app.fly.dev` (NO `https://pantera-negra-app.fly.dev` ni `pantera-negra-app.fly.dev:443`)

3. **Token generado desde un dominio diferente**
   - Asegúrate de que el token se genere desde el mismo dominio configurado
   - Verifica que no haya redirecciones o iframes que cambien el dominio

**Solución paso a paso:**

1. **Verifica las claves en Google reCAPTCHA Console:**
   ```
   - Ve a https://www.google.com/recaptcha/admin
   - Selecciona tu sitio "pantera-negra-wep"
   - Copia el Site Key (debe coincidir con VITE_RECAPTCHA_SITE_KEY)
   - Copia el Secret Key (debe coincidir con RECAPTCHA_SECRET_KEY)
   ```

2. **Verifica las variables de entorno en Fly.io:**
   ```bash
   # Verificar site key (frontend)
   flyctl secrets list | grep RECAPTCHA
   
   # Verificar secret key (backend)
   flyctl secrets list | grep RECAPTCHA
   ```

3. **Actualiza las claves si no coinciden:**
   ```bash
   # Frontend
   flyctl secrets set VITE_RECAPTCHA_SITE_KEY=tu_site_key_correcto
   
   # Backend
   flyctl secrets set RECAPTCHA_SECRET_KEY=tu_secret_key_correcto
   ```

4. **Verifica el dominio en reCAPTCHA Console:**
   - Asegúrate de que `pantera-negra-app.fly.dev` esté en la lista de dominios
   - El dominio debe estar exactamente como aparece en la URL (sin `https://`)

5. **Haz redeploy después de cambiar las claves:**
   ```bash
   flyctl deploy --buildkit --remote-only
   ```

6. **Verifica los logs después del deploy:**
   - Los logs del frontend mostrarán el dominio desde el cual se genera el token
   - Los logs del backend mostrarán el hostname que Google detecta
   - Si el hostname sigue siendo `undefined`, las claves no coinciden
- Revisa los logs del backend para ver el error específico de Google

### Puntuaciones Bajas en Desarrollo

- Es normal tener puntuaciones más bajas en desarrollo o staging
- reCAPTCHA aprende del tráfico real, así que las puntuaciones mejorarán con el tiempo
- Considera usar un umbral más bajo (0.3) en desarrollo

### Deshabilitar reCAPTCHA Temporalmente en Desarrollo

Si necesitas deshabilitar reCAPTCHA temporalmente para desarrollo:

1. **Frontend:** No configures `VITE_RECAPTCHA_SITE_KEY` (o déjala vacía)
2. **Backend:** No configures `RECAPTCHA_SECRET_KEY` (o déjala vacía)

El sistema detectará automáticamente que reCAPTCHA no está configurado y permitirá las solicitudes en modo desarrollo.

## Referencias

- [Documentación oficial de reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)
- [Admin Console de reCAPTCHA](https://www.google.com/recaptcha/admin)

