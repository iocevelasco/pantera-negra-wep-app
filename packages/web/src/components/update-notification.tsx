import { RefreshCw, X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useVersionCheck } from '@/hooks/use-version-check';
import { cn } from '@/lib/utils';

export function UpdateNotification() {
  const { hasUpdate, currentVersion, newVersion, refresh, dismissUpdate, isChecking } = useVersionCheck();

  if (!hasUpdate) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className={cn(
        "relative overflow-hidden rounded-xl shadow-2xl",
        "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500",
        "p-[2px]"
      )}>
        {/* Efecto de brillo animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
        
        <div className="relative bg-background/95 backdrop-blur-md rounded-[10px] p-4">
          <button
            onClick={dismissUpdate}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            aria-label="Cerrar notificación"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-start gap-3 pr-6">
            <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground text-sm">
                ¡Nueva versión disponible!
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentVersion} → {newVersion}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Actualiza para obtener las últimas mejoras
              </p>
              
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={refresh}
                  disabled={isChecking}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
                >
                  <RefreshCw className={cn("h-4 w-4", isChecking && "animate-spin")} />
                  Actualizar ahora
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={dismissUpdate}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Más tarde
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



