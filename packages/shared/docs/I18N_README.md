# Configuración de i18n

Este proyecto está configurado con i18next y react-i18next para soportar múltiples idiomas.

## Idiomas soportados

- **Español Latinoamericano (Argentina) (es-AR)**: Idioma por defecto
- **Portugués Brasileño (pt-BR)**

**Importante**: Este proyecto **SOLO** soporta estas variantes regionales específicas. Todos los textos deben estar en español argentino o portugués brasileño.

## Uso básico

### En componentes React

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.dashboard')}</h1>
      <p>{t('members.title')}</p>
    </div>
  );
}
```

### Cambiar idioma programáticamente

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  const changeToPortuguese = () => {
    i18n.changeLanguage('pt-BR'); // Usar pt-BR para portugués brasileño
  };
  
  const changeToSpanish = () => {
    i18n.changeLanguage('es-AR'); // Usar es-AR para español argentino
  };
  
  return (
    <div>
      <button onClick={changeToSpanish}>Español (Argentina)</button>
      <button onClick={changeToPortuguese}>Português (Brasil)</button>
    </div>
  );
}
```

### Usar el selector de idioma

```tsx
import { LanguageSelector } from '@/components/language-selector';

function Header() {
  return (
    <header>
      <LanguageSelector />
    </header>
  );
}
```

## Estructura de traducciones

Las traducciones están organizadas por secciones:

- `common`: Traducciones comunes (botones, acciones, etc.)
- `members`: Traducciones relacionadas con miembros
- `schedule`: Traducciones relacionadas con horarios
- `dashboard`: Traducciones del panel de control
- `portal`: Traducciones del portal

## Agregar nuevas traducciones

1. Edita los archivos JSON en `src/i18n/locales/es/translation.json` (español argentino) y `src/i18n/locales/pt/translation.json` (portugués brasileño)
2. Agrega las nuevas claves en **ambos** idiomas
3. Usa `t('nueva.seccion.clave')` en tus componentes
4. **NUNCA** hardcodees textos directamente en los componentes

## Reglas de Traducción

### Español Latinoamericano (Argentina)
- Usar vocabulario argentino: "Alumno", "Cinturón", "Sede", "Membresía", "Vencimiento", "Al Día"
- Evitar expresiones de otros países hispanohablantes

### Portugués Brasileño
- Usar vocabulario brasileño: "Aluno", "Faixa", "Sede", "Assinatura", "Vencimento", "Em Dia"
- Evitar expresiones de portugués de Portugal

## Detección automática

El sistema detecta automáticamente el idioma del navegador y lo normaliza a nuestras variantes regionales:
- Español detectado → `es-AR` (Español Argentina)
- Portugués detectado → `pt-BR` (Português Brasil)
- Otros idiomas → `es-AR` (por defecto)

El idioma seleccionado se guarda en localStorage para futuras visitas.

## Ver también

Para más detalles sobre las reglas de i18n, consulta `.cursor/i18n-rules.md`

