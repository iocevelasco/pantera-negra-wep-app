import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { AuthLayout } from '@/components/auth/auth-layout';
import { MatFlowLogo } from '@/components/matflow-logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/routes';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCancel = () => navigate(ROUTES.LOGIN);
  const handleSuccess = () => navigate(ROUTES.LOGIN);

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center py-6 sm:py-20 w-full">
        <div className="mb-3 sm:mb-5 flex items-center" role="banner">
          <MatFlowLogo variant="light" size="lg" />
        </div>

        <div className="w-full max-w-md">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 text-sm text-red-300/80 hover:text-red-200 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.forgotPassword.backToLogin') || 'Volver al inicio de sesión'}
          </button>

          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center">
                {t('auth.forgotPassword.title')}
              </CardTitle>
              <CardDescription className="text-center">
                {t('auth.forgotPassword.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ForgotPasswordForm onCancel={handleCancel} onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthLayout>
  );
}
