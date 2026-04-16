import { Link } from 'react-router-dom';
import { LoginFormFields } from './login-form';
import { ForgotPasswordForm } from './forgot-password-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  showForgotPassword: boolean;
  onForgotPasswordClick: () => void;
  onForgotPasswordCancel: () => void;
  onForgotPasswordSuccess: () => void;
}

export function LoginForm({
  showForgotPassword,
  onForgotPasswordClick,
  onForgotPasswordCancel,
  onForgotPasswordSuccess,
}: LoginFormProps) {
  const { t } = useTranslation();

  return (
    <div className=" inset-0 flex items-center justify-center z-50 pt-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className='text-center'>
            {showForgotPassword
              ? t('auth.forgotPassword.title') || 'Recuperar Contraseña'
              : t('auth.login.title') || 'Iniciar Sesión'}
          </CardTitle>
          <CardDescription className='text-center'>
            {showForgotPassword
              ? t('auth.forgotPassword.description') || 'Ingresa tu email para recuperar tu contraseña'
              : t('auth.login.description') || 'Ingresa tus credenciales para acceder'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <ForgotPasswordForm
            onCancel={onForgotPasswordCancel}
            onSuccess={onForgotPasswordSuccess}
            />
          ) : (
            <LoginFormFields onForgotPasswordClick={onForgotPasswordClick} />
          )}
        </CardContent>
          {!showForgotPassword && (
            <CardFooter className="flex flex-col gap-2">
              <div className="text-center text-sm text-muted-foreground">
                {t('auth.login.noAccount')}
              </div>
              <Button asChild variant="secondary" className="w-full">
                <Link to="/register">
                  {t('auth.login.registerLink')}
                </Link>
              </Button>
            </CardFooter>
          )}
      </Card>
    </div>
  );
}

