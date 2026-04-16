import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboard } from "@/providers/dashboard-provider"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function RecentSales() {
  const { stats } = useDashboard();
  
  if (stats.isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="ml-4 space-y-1 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  const recentPayments = stats.data?.recentPayments || [];

  if (recentPayments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay pagos recientes
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {recentPayments.map((payment) => (
        <div key={payment.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {payment.membershipName ? getInitials(payment.membershipName) : '??'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {payment.membershipName || 'Unknown'}
            </p>
            <p className="text-xs text-muted-foreground">
              {payment.userEmail || 'No email'}
            </p>
          </div>
          <div className="ml-auto font-medium">
            +{formatCurrency(payment.amount)}
          </div>
        </div>
      ))}
    </div>
  )
}
