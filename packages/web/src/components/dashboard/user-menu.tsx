import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/user/use-user';
import { useLogout } from '@/hooks/auth/use-auth';
import { LogOut, User, Settings, Shield } from 'lucide-react';

export function UserMenu() {
  const { t } = useTranslation();
  const { user } = useUser();
  const logoutMutation = useLogout();

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }
    return 'MS';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-2">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={user?.picture || '/placeholder.svg'} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden text-left">
            <p className="text-sm font-medium truncate">
              {user?.name || t('layout.user.name')}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.role || t('layout.user.role')}
            </p>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name || t('layout.user.name')}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Logout Option with prominent icon */}
        <DropdownMenuItem
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10"
        >
          <div className="flex items-center w-full">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-destructive/10 mr-2">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <span className="font-medium">{t('auth.logout.title')}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

