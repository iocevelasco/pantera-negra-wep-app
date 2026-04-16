import { Filter, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useTranslation } from '@/hooks/use-translation';
import type { Membership } from '@pantera-negra/shared';

export interface FilterDrawerProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;

  // Membership Status Filter
  membershipStatusFilter: Membership['status'] | 'all';
  onMembershipStatusFilterChange: (status: Membership['status'] | 'all') => void;

  // Membership Type Filter
  membershipTypeFilter: Membership['memberType'] | 'all';
  onMembershipTypeFilterChange: (memberType: Membership['memberType'] | 'all') => void;

  // Optional: Custom title and description
  title?: string;
  description?: string;

  // Optional: Show clear button
  showClearButton?: boolean;
  onClearFilters?: () => void;
}

export function FilterDrawer({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  membershipStatusFilter,
  onMembershipStatusFilterChange,
  membershipTypeFilter,
  onMembershipTypeFilterChange,
  title,
  description,
  showClearButton = true,
  onClearFilters,
}: FilterDrawerProps) {
  const { t } = useTranslation();

  const hasActiveFilters =
    searchQuery !== '' ||
    membershipStatusFilter !== 'all' ||
    membershipTypeFilter !== 'all';

  const handleClearFilters = () => {
    onSearchChange('');
    onMembershipStatusFilterChange('all');
    onMembershipTypeFilterChange('all');
    onClearFilters?.();
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Filter className="h-4 w-4" />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title || t('members.filters.title')}</DrawerTitle>
          <DrawerDescription>
            {description || t('members.filters.description')}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder || t('members.filters.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={membershipStatusFilter}
            onValueChange={(value) => onMembershipStatusFilterChange(value as Membership['status'] | 'all')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('members.filters.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('members.table.payment', { defaultValue: 'Pagos' })}</SelectItem>
              <SelectItem value="Active">{t('members.status.active')}</SelectItem>
              <SelectItem value="Inactive">{t('members.status.inactive')}</SelectItem>
              <SelectItem value="Past Due">{t('members.status.pastDue')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Member Type Filter */}
          <Select
            value={membershipTypeFilter}
            onValueChange={(value) => onMembershipTypeFilterChange(value as Membership['memberType'] | 'all')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('members.table.memberType', { defaultValue: 'Tipo' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('members.filters.allMemberTypes')}</SelectItem>
              <SelectItem value="Adult">{t('members.memberType.adult')}</SelectItem>
              <SelectItem value="Kid">{t('members.memberType.kid')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {showClearButton && hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters} className="w-full">
              <X className="mr-2 h-4 w-4" />
              {t('common.clearFilters')}
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

