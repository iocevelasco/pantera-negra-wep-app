import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/routes';

interface RouteErrorProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

/**
 * Error component for route errors
 */
export function RouteError({ error, resetErrorBoundary }: RouteErrorProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Log error for debugging
    if (error) {
      console.error('[Route Error]', error);
    }
  }, [error]);

  const handleGoHome = () => {
    navigate(ROUTES.ADMIN_ROOT);
    resetErrorBoundary?.();
  };

  const handleRetry = () => {
    resetErrorBoundary?.();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Error al cargar la página</CardTitle>
          </div>
          <CardDescription>
            Ocurrió un error inesperado. Por favor, intenta nuevamente.
          </CardDescription>
        </CardHeader>
        {error && (
          <CardContent>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-mono text-muted-foreground break-all">
                {error.message || 'Error desconocido'}
              </p>
            </div>
          </CardContent>
        )}
        <CardFooter className="flex gap-2">
          <Button onClick={handleRetry} variant="outline">
            Reintentar
          </Button>
          <Button onClick={handleGoHome}>
            Ir al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
