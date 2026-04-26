import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { MatFlowLogo } from '@/components/matflow-logo';
import { useTranslation } from 'react-i18next';
import { useResetPassword } from '@/hooks/auth/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'auth.resetPassword.errors.passwordMinLength')
    .min(1, 'auth.resetPassword.errors.passwordRequired'),
  confirmPassword: z.string().min(1, 'auth.resetPassword.errors.confirmPasswordRequired'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'auth.resetPassword.errors.passwordsDoNotMatch',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      // Redirect to login if no token
      navigate('/login');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      return;
    }
    resetPasswordMutation.mutate({
      token,
      password: data.password,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  if (!token) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <MatFlowLogo size="lg" />
        </div>

        <Card className="border" role="main" aria-labelledby="reset-password-title">
          <CardHeader className="text-center">
            <CardTitle id="reset-password-title" className="text-2xl">
              {t('auth.resetPassword.title') || 'Restablecer contraseña'}
            </CardTitle>
            <CardDescription id="reset-password-description">
              {t('auth.resetPassword.subtitle') || 'Ingresa tu nueva contraseña'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {resetPasswordMutation.isError && (
              <Alert variant="destructive" role="alert" aria-live="assertive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {resetPasswordMutation.error instanceof Error
                    ? resetPasswordMutation.error.message
                    : t('auth.resetPassword.errors.failed') || 'Error al restablecer contraseña'}
                </AlertDescription>
              </Alert>
            )}

            {resetPasswordMutation.isSuccess && (
              <Alert variant="default" role="alert" aria-live="assertive">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  {t('auth.resetPassword.success') || 'Contraseña restablecida exitosamente'}
                </AlertDescription>
              </Alert>
            )}

            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-4"
              noValidate
              aria-label={t('auth.resetPassword.title') || 'Formulario de restablecimiento de contraseña'}
            >
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t('auth.resetPassword.password') || 'Nueva contraseña'}
                  <span className="text-destructive ml-1" aria-label="requerido">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('auth.resetPassword.passwordPlaceholder') || 'Mínimo 8 caracteres'}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    aria-required="true"
                    {...register('password')}
                    disabled={isSubmitting || resetPasswordMutation.isPending}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                    disabled={isSubmitting || resetPasswordMutation.isPending}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                    aria-controls="password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p 
                    id="password-error" 
                    className="text-sm text-destructive flex items-center gap-1"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                    {t(errors.password.message || 'auth.resetPassword.errors.passwordMinLength')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t('auth.resetPassword.confirmPassword') || 'Confirmar nueva contraseña'}
                  <span className="text-destructive ml-1" aria-label="requerido">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={t('auth.resetPassword.confirmPasswordPlaceholder') || 'Repite tu nueva contraseña'}
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                    aria-required="true"
                    {...register('confirmPassword')}
                    disabled={isSubmitting || resetPasswordMutation.isPending}
                    className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleConfirmPasswordVisibility}
                    disabled={isSubmitting || resetPasswordMutation.isPending}
                    aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                    aria-pressed={showConfirmPassword}
                    aria-controls="confirmPassword"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p 
                    id="confirm-password-error" 
                    className="text-sm text-destructive flex items-center gap-1"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                    {t(errors.confirmPassword.message || 'auth.resetPassword.errors.passwordsDoNotMatch')}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || resetPasswordMutation.isPending}
                aria-busy={isSubmitting || resetPasswordMutation.isPending}
              >
                {isSubmitting || resetPasswordMutation.isPending
                  ? t('auth.resetPassword.submitting') || 'Restableciendo...'
                  : t('auth.resetPassword.submit') || 'Restablecer contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.resetPassword.backToLogin') || 'Volver al inicio de sesión'}
          </Link>
        </div>
      </div>
    </div>
  );
}

