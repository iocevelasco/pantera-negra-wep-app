import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { LoginForm } from "@/components/auth/login-form-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { MatFlowLogo } from "@/components/matflow-logo";
import { toast } from "sonner";

export function LoginPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error(
        error === 'no_token'
          ? t('auth.oauth.noToken') || 'No se recibió el token de autenticación'
          : error === 'no_code'
          ? t('auth.oauth.noCode') || 'No se recibió el código de autorización'
          : error === 'no_tenant'
          ? t('auth.oauth.noTenant') || 'No se pudo determinar el tenant'
          : t('auth.oauth.error') || 'Error en la autenticación'
      );
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams, t]);

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center py-6 sm:py-20 w-full">
        <div className="mb-3 sm:mb-5 flex items-center" role="banner">
          <MatFlowLogo variant="light" size="lg" />
        </div>
        <div className="mb-3 sm:mb-5 flex items-center gap-2">
          <p className="text-sm uppercase tracking-[0.25em] text-red-300/80">
            {t("layout.welcome")}
          </p>
        </div>
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  );
}
