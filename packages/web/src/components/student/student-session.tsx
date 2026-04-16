import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogout } from '@/hooks/auth/use-auth';

export function StudentSession() {
  const { t } = useTranslation();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="flex items-center justify-center gap-2 w-full sm:w-auto text-[10px] font-mono font-bold uppercase tracking-[0.2em] border-border hover:bg-primary hover:text-white transition-all duration-300 h-10 px-6"
      size="sm"
    >
      <LogOut className="h-4 w-4 text-primary group-hover:text-white" />
      {t('portal.session.logout')}
    </Button>
  );
}


