import { createContext, useContext, ReactNode, useState } from 'react';
import { useDashboardStats } from '@/hooks/dashboard/use-dashboard';
import { useMembershipsStore } from "@/stores/memberships-store";
import { useUser } from '@/hooks/user/use-user';

interface DashboardContextValue {
  stats: ReturnType<typeof useDashboardStats>;
  sidebarOpen: boolean;
  selectedTenantId: string | null;
  setSelectedTenantId: (tenantId: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const { user: currentUser } = useUser();
  
  // Determine tenant filter: if user is admin, use their tenant_id, otherwise use selectedTenantId
  const effectiveTenantId = currentUser?.role === 'admin' && currentUser?.tenant_id
    ? currentUser.tenant_id
    : (selectedTenantId || undefined);
  
  const stats = useDashboardStats(effectiveTenantId);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <DashboardContext.Provider
      value={{
        stats,
        sidebarOpen,
        selectedTenantId,
        setSelectedTenantId,
        setSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

