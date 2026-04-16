import { useState, useEffect, useCallback } from 'react';

const CURRENT_VERSION = import.meta.env.VITE_APP_VERSION as string;
const CHECK_INTERVAL = 60 * 1000; // Verificar cada 60 segundos

interface VersionCheckState {
  hasUpdate: boolean;
  currentVersion: string;
  newVersion: string | null;
  isChecking: boolean;
  lastChecked: Date | null;
}

export function useVersionCheck() {
  const [state, setState] = useState<VersionCheckState>({
    hasUpdate: false,
    currentVersion: CURRENT_VERSION,
    newVersion: null,
    isChecking: false,
    lastChecked: null,
  });

  const checkForUpdate = useCallback(async () => {
    setState(prev => ({ ...prev, isChecking: true }));
    
    try {
      // Agregar un timestamp para evitar cache
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      
      if (!response.ok) {
        console.warn('No se pudo verificar la versión');
        return;
      }
      
      const data = await response.json();
      const serverVersion = data.version;
      
      const hasUpdate = serverVersion !== CURRENT_VERSION;
      
      setState(prev => ({
        ...prev,
        hasUpdate,
        newVersion: hasUpdate ? serverVersion : null,
        isChecking: false,
        lastChecked: new Date(),
      }));
      
      if (hasUpdate) {
        console.log(`Nueva versión disponible: ${serverVersion} (actual: ${CURRENT_VERSION})`);
      }
    } catch (error) {
      console.error('Error al verificar actualizaciones:', error);
      setState(prev => ({ ...prev, isChecking: false }));
    }
  }, []);

  const refresh = useCallback(() => {
    // Forzar una recarga completa de la página, limpiando el cache
    window.location.reload();
  }, []);

  const dismissUpdate = useCallback(() => {
    setState(prev => ({ ...prev, hasUpdate: false }));
  }, []);

  // Verificar al montar y luego periódicamente
  useEffect(() => {
    // Primera verificación después de 5 segundos (dar tiempo a que cargue la app)
    const initialTimeout = setTimeout(() => {
      checkForUpdate();
    }, 5000);

    // Verificaciones periódicas
    const interval = setInterval(checkForUpdate, CHECK_INTERVAL);

    // También verificar cuando la pestaña vuelve a estar visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForUpdate]);

  return {
    ...state,
    checkForUpdate,
    refresh,
    dismissUpdate,
  };
}



