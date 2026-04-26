import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Pencil, Trash2, MapPin, Globe, Mail } from 'lucide-react';
import { useOrganization, useDojos, useDeleteOrganization, useDeleteDojo } from '@/hooks/network/use-organizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/routes';
import type { Tenant } from '@pantera-negra/shared';
import { MARTIAL_ART_RANKS } from '@pantera-negra/shared';

const MARTIAL_ART_LABELS: Record<string, string> = {
  BJJ: 'Brazilian Jiu-Jitsu', Karate: 'Karate', Judo: 'Judo',
  Taekwondo: 'Taekwondo', MuayThai: 'Muay Thai', MMA: 'MMA',
  Boxing: 'Boxing', Kickboxing: 'Kickboxing', Wrestling: 'Wrestling', Other: 'Other',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function DojoCard({ dojo, orgId, onDelete }: { dojo: Tenant; orgId: string; onDelete: (id: string) => void }) {
  const ranks = MARTIAL_ART_RANKS[dojo.martial_art] ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {dojo.logo_url && <img src={dojo.logo_url} alt={dojo.name} className="h-8 w-8 rounded object-contain shrink-0" />}
            <div className="min-w-0">
              <CardTitle className="text-sm truncate">{dojo.name}</CardTitle>
              <Badge variant="outline" className="text-xs mt-1">{MARTIAL_ART_LABELS[dojo.martial_art] ?? dojo.martial_art}</Badge>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button asChild variant="ghost" size="icon" className="h-7 w-7">
              <Link to={ROUTES.NETWORK_DOJO_EDIT(orgId, dojo.id)}><Pencil className="h-3.5 w-3.5" /></Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(dojo.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        {dojo.address?.city && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{[dojo.address.city, dojo.address.state, dojo.address.country].filter(Boolean).join(', ')}</span>
          </div>
        )}
        {dojo.website && (
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <a href={dojo.website} target="_blank" rel="noreferrer" className="hover:underline truncate">{dojo.website}</a>
          </div>
        )}
        {dojo.email && (
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span className="truncate">{dojo.email}</span>
          </div>
        )}
        {/* Rank system preview */}
        <div className="flex flex-wrap gap-1 pt-1">
          {ranks.slice(0, 5).map(r => (
            <span key={r.key} className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full border" style={{ backgroundColor: r.color, borderColor: r.color === '#FFFFFF' ? '#d1d5db' : r.color }} />
              <span>{r.label.split(' ')[0]}</span>
            </span>
          ))}
          {ranks.length > 5 && <span>+{ranks.length - 5} more</span>}
        </div>
        {/* Schedule */}
        {dojo.schedule && dojo.schedule.length > 0 && (
          <div className="pt-1">
            <p className="font-medium text-foreground mb-1">Schedule</p>
            <div className="space-y-0.5">
              {dojo.schedule.map((s, i) => (
                <div key={i}>{DAYS[s.day]}: {s.open} – {s.close}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: org, isLoading: orgLoading } = useOrganization(id!);
  const { data: dojos = [], isLoading: dojosLoading } = useDojos(id!);
  const deleteOrg = useDeleteOrganization();
  const deleteDojo = useDeleteDojo(id!);

  if (orgLoading) return <div className="min-h-screen flex items-center justify-center"><Skeleton className="h-40 w-96" /></div>;
  if (!org) return <div className="p-8 text-center text-muted-foreground">Organization not found</div>;

  const handleDeleteOrg = async () => {
    if (!confirm(`Delete organization "${org.name}"? This cannot be undone.`)) return;
    await deleteOrg.mutateAsync(org.id);
    navigate(ROUTES.NETWORK_ORGANIZATIONS);
  };

  const handleDeleteDojo = async (dojoId: string) => {
    const dojo = dojos.find(d => d.id === dojoId);
    if (!confirm(`Delete dojo "${dojo?.name}"? This cannot be undone.`)) return;
    deleteDojo.mutate(dojoId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-secondary text-secondary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link to={ROUTES.NETWORK_ROOT}><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <span className="text-sm text-muted-foreground">Network Dashboard</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {org.logo_url && <img src={org.logo_url} alt={org.name} className="h-12 w-12 rounded-lg object-contain bg-white p-1" />}
              <div>
                <h1 className="text-xl font-bold">{org.name}</h1>
                {org.description && <p className="text-sm text-muted-foreground">{org.description}</p>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button asChild variant="outline" size="sm">
                <Link to={`${ROUTES.NETWORK_ORGANIZATION_DETAIL(org.id)}/edit`}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteOrg} disabled={deleteOrg.isPending}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Dojos ({dojos.length})</h2>
          <Button asChild size="sm">
            <Link to={ROUTES.NETWORK_DOJO_NEW(org.id)}><Plus className="h-4 w-4 mr-1" />Add Dojo</Link>
          </Button>
        </div>

        {dojosLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : dojos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center space-y-3">
              <p className="text-muted-foreground">No dojos yet</p>
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.NETWORK_DOJO_NEW(org.id)}><Plus className="h-4 w-4 mr-1" />Add your first dojo</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dojos.map(dojo => (
              <DojoCard key={dojo.id} dojo={dojo} orgId={org.id} onDelete={handleDeleteDojo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
