import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/api/auth';
import { useAuth } from '@/providers/auth-provider';
import { useUserStore } from '@/stores/user-store';
import { ROUTES } from '@/lib/routes';
import type { AuthResponse } from '@pantera-negra/shared';

export function useRegisterDojo() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password: string;
      academyName: string;
      martialArt: string;
    }) => authApi.registerDojo(data),

    onSuccess: (data: AuthResponse) => {
      login(data.accessToken, data.user);
      useUserStore.getState().setUser(data.user as any);
      // Redirect to dashboard with welcome flag
      navigate(`${ROUTES.ADMIN_ROOT}?welcome=true`);
      toast.success(`¡Bienvenido a MatFlow! Tu academia fue creada.`);
    },

    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear la academia. Intenta de nuevo.');
    },
  });
}
