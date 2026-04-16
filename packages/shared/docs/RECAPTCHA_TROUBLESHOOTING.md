# Solución de Problemas de reCAPTCHA

## Error: "invalid-input-response" con hostname "unknown" o "undefined"

Este es el error más común en producción. Cuando Google devuelve `hostname: undefined`, **casi siempre significa que el Site Key y Secret Key NO coinciden** (son de diferentes sitios de reCAPTCHA).

### 🔍 Diagnóstico Rápido

Si ves este error en los logs:
```
❌ [RECAPTCHA] Invalid input response: { tokenHostname: undefined }
```

**99% de las veces** significa que las claves no coinciden.

### ✅ Solución Paso a Paso

#### 1. Verificar las Claves en Google reCAPTCHA Console

1. Ve a [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Selecciona tu sitio **"pantera-negra-wep"**
3. **IMPORTANTE**: Asegúrate de copiar AMBAS claves del MISMO sitio:
   - **Site Key** (clave pública) - para el frontend
   - **Secret Key** (clave privada) - para el backend

#### 2. Verificar las Claves Actuales en Fly.io

```bash
# Ver todas las variables de entorno relacionadas con reCAPTCHA
flyctl secrets list | grep RECAPTCHA
```

Deberías ver:
- `VITE_RECAPTCHA_SITE_KEY` (frontend)
- `RECAPTCHA_SECRET_KEY` (backend)

#### 3. Comparar las Claves

Las claves deben ser del mismo sitio. Si tienes múltiples sitios de reCAPTCHA, asegúrate de usar las claves del sitio correcto.

**Ejemplo de claves del mismo sitio:**
- Site Key: `6LdW4T4sAAAAAGI_F8LsdJExrgytW3YzVV-dQ2VZ`
- Secret Key: `6LdW4T4sAAAAAM0LpZIE0E_HJwjQ47d0LX0zU71F`

Ambas deben empezar con los mismos caracteres iniciales (en este caso `6LdW4T4sAAAAA`).

#### 4. Actualizar las Claves en Fly.io

Si las claves no coinciden, actualízalas:

```bash
# Frontend (Site Key)
flyctl secrets set VITE_RECAPTCHA_SITE_KEY=6LdW4T4sAAAAAGI_F8LsdJExrgytW3YzVV-dQ2VZ

# Backend (Secret Key)
flyctl secrets set RECAPTCHA_SECRET_KEY=6LdW4T4sAAAAAM0LpZIE0E_HJwjQ47d0LX0zU71F
```

**⚠️ IMPORTANTE**: Reemplaza los valores con las claves REALES de tu consola de reCAPTCHA.

#### 5. Verificar el Dominio en reCAPTCHA Console

1. En la consola de reCAPTCHA, ve a la sección "Domains"
2. Asegúrate de que `pantera-negra-app.fly.dev` esté en la lista
3. El dominio debe estar exactamente como aparece en la URL (sin `https://`, sin puerto)

#### 6. Hacer Redeploy

Después de actualizar las claves, haz redeploy:

```bash
flyctl deploy --buildkit --remote-only
```

#### 7. Verificar los Logs

Después del deploy, intenta hacer login y revisa los logs:

```bash
# Ver logs en tiempo real
flyctl logs

# O ver logs específicos de reCAPTCHA
flyctl logs | grep RECAPTCHA
```

Deberías ver:
- `✅ [RECAPTCHA] Verification successful` si todo está correcto
- O más detalles del error si aún hay problemas

### 🔧 Verificación Adicional

#### Verificar que el Token se Genera Correctamente

En los logs del frontend (consola del navegador), deberías ver:
```
✅ [RECAPTCHA] Token generated successfully for action: login
📍 [RECAPTCHA] Context: {
  hostname: "pantera-negra-app.fly.dev",
  origin: "https://pantera-negra-app.fly.dev",
  protocol: "https:",
  isHttps: true
}
```

#### Verificar que el Token se Verifica Correctamente

En los logs del backend, deberías ver:
```
✅ [RECAPTCHA] Verification successful. Score: 0.9, Action: login
```

Si ves `hostname: undefined`, las claves NO coinciden.

### 🚨 Problemas Comunes

#### Problema 1: Claves de Diferentes Sitios

**Síntoma**: `hostname: undefined` en los logs

**Causa**: El Site Key y Secret Key son de diferentes sitios de reCAPTCHA

**Solución**: Usa las claves del mismo sitio

#### Problema 2: Dominio No Configurado

**Síntoma**: `browser-error` en los logs

**Causa**: El dominio no está en la lista de dominios permitidos

**Solución**: Agrega `pantera-negra-app.fly.dev` a la lista de dominios en reCAPTCHA Console

#### Problema 3: Token Expirado

**Síntoma**: `invalid-input-response` con `challenge_ts` muy antiguo

**Causa**: El token expiró (tokens expiran después de 2 minutos)

**Solución**: Genera un nuevo token (normalmente se hace automáticamente)

### 📝 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] Las claves en Fly.io coinciden con las de reCAPTCHA Console
- [ ] El Site Key y Secret Key son del mismo sitio
- [ ] El dominio `pantera-negra-app.fly.dev` está en la lista de dominios permitidos
- [ ] Las claves están actualizadas en Fly.io (después de cambiarlas, se hizo redeploy)
- [ ] El sitio usa HTTPS (reCAPTCHA requiere HTTPS en producción)
- [ ] Los logs muestran que el token se genera correctamente en el frontend

### 🔗 Referencias

- [Documentación oficial de reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)
- [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [Configuración de reCAPTCHA](./RECAPTCHA_SETUP.md)

