import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LayoutGrid, Table as TableIcon } from 'lucide-react';
import { MembersTable } from './members-table';
import { MembersList } from './members-list';
import { useUsers } from '@/hooks/users/use-users';
import { useUsersStore } from '@/stores/users-store';
import { useMembershipsStore } from '@/stores/memberships-store';
import { useUser } from '@/hooks/user/use-user';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import type { UserWithRelations } from '@/api/users';

interface MembersTableContainerProps {
  loadingLabel?: string;
}

export function MembersTableContainer({
  loadingLabel,
}: MembersTableContainerProps) {
  const { t } = useTranslation();
  
  // Get viewMode from store
  const { viewMode, setViewMode } = useMembershipsStore();

  // Get current user to filter by tenant if admin
  const { user: currentUser } = useUser();
  
  // Determine tenant filter: if user is admin, filter by their tenant_id
  const tenantFilterId = currentUser?.role === 'admin' && currentUser?.tenant_id 
    ? currentUser.tenant_id 
    : undefined;
  
  // Fetch users directly here
  const { data: users = [], isLoading, error } = useUsers(tenantFilterId);

  // Get filters from store
  const {
    searchQuery,
    roleFilter,
    tenantFilter,
    membershipStatusFilter,
    membershipTypeFilter,
  } = useUsersStore();

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter((user: UserWithRelations) => {
      // Search filter (name or email)
      const matchesSearch = 
        !searchQuery ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Role filter
      const matchesRole = 
        !roleFilter || 
        roleFilter === 'all' ||
        user.roles?.includes(roleFilter as any);

      // Tenant filter
      const matchesTenant = 
        !tenantFilter ||
        tenantFilter === 'all' ||
        user.tenant_id === tenantFilter;

      // Membership status filter
      const matchesMembershipStatus = 
        !membershipStatusFilter || 
        membershipStatusFilter === 'all' ||
        user.membership?.status === membershipStatusFilter;

      // Membership type filter
      const matchesMembershipType = 
        !membershipTypeFilter ||
        membershipTypeFilter === 'all' ||
        user.membership?.memberType === membershipTypeFilter;

      return matchesSearch && matchesRole && matchesTenant && matchesMembershipStatus && matchesMembershipType;
    });
  }, [users, searchQuery, roleFilter, tenantFilter, membershipStatusFilter, membershipTypeFilter]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            {error instanceof Error ? error.message : t('members.messages.loadError')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
      <>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-sm text-muted-foreground">{loadingLabel || t('common.loading')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-end gap-3">
              <div className="flex items-center gap-2">
              {viewMode === 'table' ? (
                  <> 
                    <TableIcon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="view-mode" className="text-sm">
                      {t('members.viewMode.table', { defaultValue: 'Tabla' })}
                    </Label>
                  </>
                ) : (
                  <>
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="view-mode" className="text-sm">
                      {t('members.viewMode.cards', { defaultValue: 'Tarjetas' })}
                    </Label>
                  </>
                )}
                <Switch
                  id="view-mode"
                  checked={viewMode === 'table'}
                  onCheckedChange={(checked) => setViewMode(checked ? 'table' : 'cards')}
                />
              </div>
            </div>

            {/* Render based on view mode */}
            {viewMode === 'cards' ? (
              <MembersList users={filteredUsers} />
            ) : (
              <MembersTable users={filteredUsers} />
            )}
          </div>
        )}
      </>
  );
}
