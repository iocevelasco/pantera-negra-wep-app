import type React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, CalendarDays, X, ClipboardList, CreditCard, GraduationCap } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { UserMenu } from './user-menu';
import { useEffect, useRef } from 'react';
import { useDashboard } from '@/providers/dashboard-provider';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/user/use-user';
import { useQuery } from '@tanstack/react-query';
import { tenantsApi } from '@/api/tenants';
import { QueryKeys } from '@/lib/query-keys';

export function DashboardSidebar() {
  const location = useLocation();
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen } = useDashboard();
  const prevPathnameRef = useRef(location.pathname);
  const { user } = useUser();

  // Fetch tenant information
  const { data: tenant } = useQuery({
    queryKey: [QueryKeys.tenant, user?.tenant_id],
    queryFn: () => tenantsApi.getById(user!.tenant_id!),
    enabled: !!user?.tenant_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Close sidebar when route changes on mobile (only on actual route change)
  useEffect(() => {
    // Only close if the pathname actually changed (not just on mount)
    if (prevPathnameRef.current !== location.pathname) {
      // Close sidebar on mobile when navigating to a new route
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
      prevPathnameRef.current = location.pathname;
    }
  }, [location.pathname, setSidebarOpen]);


  return (
    <>
      {/* Mobile overlay with fade animation */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 md:hidden',
          'transition-opacity duration-300 ease-in-out',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar with slide animation */}
      <aside
        className={cn(
          'w-64 border-r bg-card flex flex-col h-screen fixed md:sticky top-0 z-50',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
      <div className="h-auto min-h-16 flex items-center justify-between px-6 border-b py-2">
        <div className="flex items-center flex-1 min-w-0">
          <img 
            src="/logo.png" 
            alt="Pantera Negra" 
            className="h-12 w-auto object-contain mr-3 border-2 rounded-full shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-lg tracking-tight truncate">{t('layout.appName')}</h3>
            {tenant && (
              <span 
                className="text-xs text-black font-medium truncate bg-white rounded-full px-2 py-0.5 inline-block w-fit" 
                title={tenant.name}
              >
                {tenant.name}
              </span>
            )}
          </div>
        </div>
        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">

        <div>
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            {t('layout.sections.management')}
          </h3>
          <div className="space-y-1">
            <NavItem href="/" icon={Users} isActive={location.pathname === '/'}>
              {t('layout.navigation.members')}
            </NavItem>
            <NavItem href="/schedule-management" icon={CalendarDays} isActive={location.pathname === '/schedule-management'}>
              {t('layout.navigation.scheduleManagement')}
            </NavItem>
            <NavItem href="/admin/registrations" icon={ClipboardList} isActive={location.pathname === '/admin/registrations'}>
              {t('layout.navigation.registrations', 'Solicitudes de Registro')}
            </NavItem>
            <NavItem href="/admin/membership-plans" icon={CreditCard} isActive={location.pathname === '/admin/membership-plans'}>
              {t('layout.navigation.membershipPlans', 'Planes de Membresía')}
            </NavItem>
            <NavItem href="/admin/private-classes" icon={GraduationCap} isActive={location.pathname === '/admin/private-classes'}>
              {t('layout.navigation.privateClasses', 'Clases Privadas')}
            </NavItem>
            <NavItem href="/panel" icon={LayoutDashboard} isActive={location.pathname === '/panel'}>
              {t('layout.navigation.dashboard')}
            </NavItem>
          </div>
        </div>
      </div>

      <div className="p-4 border-t bg-muted/20">
        <UserMenu />
      </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  icon: Icon,
  children,
  isActive,
}: {
  href: string;
  icon: any;
  children: React.ReactNode;
  isActive?: boolean;
}) {
  return (
    <Link to={href}>
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start gap-3 cursor-pointer font-normal transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-secondary'
        )}
        size="sm"
      >
        <Icon className="w-4 h-4 text-muted-foreground" />
        {children}
      </Button>
    </Link>
  );
}

