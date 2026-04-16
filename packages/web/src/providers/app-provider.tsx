import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './auth-provider';
import { MembersProvider } from './members-provider';
import { DashboardProvider } from './dashboard-provider';
import { UserProvider } from '@/components/user-provider';

interface AppProviderProps {
  children: ReactNode;
}


export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="vite-ui-theme">
      <AuthProvider>
        <MembersProvider>
          <UserProvider>
            <DashboardProvider>{children}</DashboardProvider>
          </UserProvider>
        </MembersProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

