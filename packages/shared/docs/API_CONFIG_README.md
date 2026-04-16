# Configuración del Proyecto

Esta carpeta contiene archivos de configuración del proyecto.

## admin-whitelist.json

Archivo de configuración para la whitelist de administradores. Los usuarios con email en esta lista serán considerados administradores automáticamente.

### Estructura del archivo

```json
{
  "emails": [
    "admin@example.com",
    "user@example.com"
  ],
  "emailToTenants": {
    "admin@example.com": ["tenant-id-1", "tenant-id-2"],
    "user@example.com": []
  }
}
```

### Campos

- **emails**: Array de emails que serán considerados administradores
- **emailToTenants**: Objeto que mapea emails a arrays de tenant IDs
  - Si un email tiene un array vacío `[]` o no está en el objeto, será admin en **todos los tenants**
  - Si un email tiene tenant IDs específicos, será admin solo en esos tenants

### Prioridad de configuración

1. **Variables de entorno** (tienen prioridad):
   - `ADMIN_WHITELIST`: Lista de emails separados por comas
   - `ADMIN_WHITELIST_JSON`: JSON string con el mapeo de emails a tenants

2. **Archivo JSON** (`admin-whitelist.json`): Se usa si las variables de entorno no están definidas

### Ejemplo

Para agregar un nuevo administrador, simplemente agrega su email al array `emails`:

```json
{
  "emails": [
    "iocevelasco@gmail.com",
    "nuevo-admin@example.com"
  ],
  "emailToTenants": {}
}
```

Si quieres que un admin solo tenga acceso a tenants específicos:

```json
{
  "emails": [
    "admin@example.com"
  ],
  "emailToTenants": {
    "admin@example.com": ["tenant-id-1", "tenant-id-2"]
  }
}
```

