import { Link } from 'react-router-dom';
import { Plus, Building2, Users, Dumbbell } from 'lucide-react';
import { useOrganizations } from '@/hooks/network/use-organizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/routes';

const MARTIAL_ART_LABELS: Record<string, string> = {
  BJJ: 'BJJ', Karate: 'Karate', Judo: 'Judo', Taekwondo: 'Taekwondo',
  MuayThai: 'Muay Thai', MMA: 'MMA', Boxing: 'Boxing', Kickboxing: 'Kickboxing',
  Wrestling: 'Wrestling', Other: 'Other',
};

export default function NetworkDashboard() {
  const { data: organizations = [], isLoading } = useOrganizations();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-secondary text-secondary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Network Dashboard</h1>
              <p className="text-xs text-muted-foreground">Manage your martial arts organizations</p>
            </div>
          </div>
          <Button asChild>
            <Link to={ROUTES.NETWORK_ORGANIZATION_NEW}>
              <Plus className="h-4 w-4 mr-2" />
              New Organization
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{organizations.length}</p>
                <p className="text-sm text-muted-foreground">Organizations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <Dumbbell className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {organizations.reduce((acc, o) => acc + (o.dojo_count ?? 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Dojos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organizations list */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Organizations</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : organizations.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/40" />
                <div>
                  <p className="font-medium">No organizations yet</p>
                  <p className="text-sm text-muted-foreground">Create your first organization to start managing dojos</p>
                </div>
                <Button asChild variant="outline">
                  <Link to={ROUTES.NETWORK_ORGANIZATION_NEW}>
                    <Plus className="h-4 w-4 mr-2" /> Create Organization
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizations.map(org => (
                <Link key={org.id} to={ROUTES.NETWORK_ORGANIZATION_DETAIL(org.id)}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      {org.logo_url && (
                        <img src={org.logo_url} alt={org.name} className="h-10 w-10 rounded-md object-contain mb-2" />
                      )}
                      <CardTitle className="text-base">{org.name}</CardTitle>
                      {org.description && (
                        <CardDescription className="line-clamp-2 text-xs">{org.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{org.dojo_count ?? 0} dojo(s)</span>
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
