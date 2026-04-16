import { Menu, Search, X, UserPlus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import { useDashboard } from '@/providers/dashboard-provider';
import { useUsersStore } from '@/stores/users-store';
import { FilterDrawer } from '@/components/filters/filter-drawer';
import type { Membership } from '@pantera-negra/shared';

interface DashboardHeaderProps {
  title?: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const { toggleSidebar } = useDashboard();
  const { t } = useTranslation();
  const { openAddModal } = useUsersStore();
  const location = useLocation();
  
  // Only show filters on the home page
  const isHomePage = location.pathname === '/';
  
  const {
    searchQuery,
    membershipStatusFilter,
    membershipTypeFilter,
    setSearchQuery,
    setMembershipStatusFilter,
    setMembershipTypeFilter,
  } = useUsersStore();

  // Check if any filter is active
  const hasActiveFilters = 
    searchQuery !== '' ||
    membershipStatusFilter !== 'all' ||
    membershipTypeFilter !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setMembershipStatusFilter('all');
    setMembershipTypeFilter('all');
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Menu button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold truncate">{title || t('layout.defaultTitle')}</h1>
        </div>
        
        {/* Desktop Filters - Only shown on home page */}
        {isHomePage && (
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-full justify-end">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('members.filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={membershipStatusFilter} onValueChange={(value) => setMembershipStatusFilter(value as Membership['status'] | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('members.filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('members.filters.allStatuses')}</SelectItem>
                <SelectItem value="Active">{t('members.status.active')}</SelectItem>
                <SelectItem value="Inactive">{t('members.status.inactive')}</SelectItem>
                <SelectItem value="Past Due">{t('members.status.pastDue')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={membershipTypeFilter} onValueChange={(value) => setMembershipTypeFilter(value as Membership['memberType'] | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('members.filters.memberType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('members.filters.allMemberTypes')}</SelectItem>
                <SelectItem value="Adult">{t('members.memberType.adult')}</SelectItem>
                <SelectItem value="Kid">{t('members.memberType.kid')}</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="outline" size="icon" onClick={clearAllFilters} title={t('common.clearFilters')}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button onClick={openAddModal} className="gap-2">
              <UserPlus className="h-4 w-4" />
              {t('members.addMember') || 'Agregar Alumno'}
            </Button>
          </div>
        )}

        {/* Mobile Filters Button - Only shown on home page */}
        {isHomePage && (
          <div className="lg:hidden flex items-center gap-2">
            <Button onClick={openAddModal} size="icon" className="gap-2">
              <UserPlus className="h-4 w-4" />
            </Button>
            <FilterDrawer
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              membershipStatusFilter={membershipStatusFilter}
              onMembershipStatusFilterChange={setMembershipStatusFilter}
              membershipTypeFilter={membershipTypeFilter}
              onMembershipTypeFilterChange={setMembershipTypeFilter}
              onClearFilters={clearAllFilters}
            />
          </div>
        )}
      </div>

      {/* Tablet Filters (md to lg) - Only shown on home page */}
      {isHomePage && (
        <div className="lg:hidden md:flex hidden items-center gap-2 px-4 pb-3 border-t">
          <div className="relative flex-1 max-w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('members.filters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={membershipStatusFilter} onValueChange={(value) => setMembershipStatusFilter(value as Membership['status'] | 'all')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t('members.filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('members.filters.allStatuses')}</SelectItem>
                <SelectItem value="Active">{t('members.status.active')}</SelectItem>
                <SelectItem value="Inactive">{t('members.status.inactive')}</SelectItem>
                <SelectItem value="Past Due">{t('members.status.pastDue')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={membershipTypeFilter} onValueChange={(value) => setMembershipTypeFilter(value as Membership['memberType'] | 'all')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t('members.filters.memberType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('members.filters.allMemberTypes')}</SelectItem>
                <SelectItem value="Adult">{t('members.memberType.adult')}</SelectItem>
                <SelectItem value="Kid">{t('members.memberType.kid')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </header>
  );
}

