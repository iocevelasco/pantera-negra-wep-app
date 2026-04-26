import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DojoForm } from '@/components/network/dojo-form';
import { useCreateDojo } from '@/hooks/network/use-organizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/routes';

export default function DojoNew() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const create = useCreateDojo(orgId!);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-secondary text-secondary-foreground">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link to={ROUTES.NETWORK_ORGANIZATION_DETAIL(orgId!)}><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <span className="text-sm text-muted-foreground">Organization</span>
          </div>
          <h1 className="text-xl font-bold">Add New Dojo</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Card>
          <CardHeader><CardTitle>Dojo Details</CardTitle></CardHeader>
          <CardContent>
            <DojoForm
              orgId={orgId!}
              isLoading={create.isPending}
              onSubmit={async (values) => {
                await create.mutateAsync(values as Record<string, unknown>);
                navigate(ROUTES.NETWORK_ORGANIZATION_DETAIL(orgId!));
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
