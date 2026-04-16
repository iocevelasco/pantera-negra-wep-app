import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { privatePlansApi } from '@/api/private-plans';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryKeys } from '@/lib/query-keys';

export function PrivatePlansTab() {
  const { t } = useTranslation();

  const { data: plans, isLoading } = useQuery({
    queryKey: [QueryKeys.privatePlans],
    queryFn: () => privatePlansApi.getAll(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {t('privateClasses.plans.title', 'Planes Privados')}
        </h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('privateClasses.plans.create', 'Crear Plan')}
        </Button>
      </div>

      {!plans || plans.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('privateClasses.plans.empty', 'No hay planes creados aún')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4">
              <h4 className="font-semibold">{plan.name}</h4>
              <p className="text-sm text-muted-foreground">
                {plan.sessions_total} {t('privateClasses.plans.sessions', 'sesiones')}
              </p>
              {plan.price_cents && (
                <p className="text-sm font-medium mt-2">
                  ${(plan.price_cents / 100).toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
