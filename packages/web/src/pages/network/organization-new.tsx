import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { OrganizationForm } from '@/components/network/organization-form';
import { useCreateOrganization } from '@/hooks/network/use-organizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/routes';

export default function OrganizationNew() {
  const navigate = useNavigate();
  const create = useCreateOrganization();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-secondary text-secondary-foreground">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link to={ROUTES.NETWORK_ROOT}><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <span className="text-sm text-muted-foreground">Network Dashboard</span>
          </div>
          <h1 className="text-xl font-bold">New Organization</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent>
            <OrganizationForm
              submitLabel="Create Organization"
              isLoading={create.isPending}
              onSubmit={async (values) => {
                const res = await create.mutateAsync(values);
                navigate(ROUTES.NETWORK_ORGANIZATION_DETAIL(res.data.id));
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
