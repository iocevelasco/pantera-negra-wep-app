import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useForgotPassword } from '@/hooks/auth/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRecaptcha } from '@/hooks/use-recaptcha';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'auth.forgotPassword.errors.emailRequired')
    .email('auth.forgotPassword.errors.invalidEmail'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export function ForgotPasswordForm({ onCancel, onSuccess }: ForgotPasswordFormProps) {
  const { t } = useTranslation();
  const forgotPasswordMutation = useForgotPassword();
  const { executeRecaptchaAction } = useRecaptcha();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // Execute reCAPTCHA before submitting (returns empty string in development)
      const recaptchaToken = await executeRecaptchaAction('forgot_password');
      // In development, token can be empty - backend will handle it
      forgotPasswordMutation.mutate({ ...data, recaptchaToken }, {
        onSuccess: () => {
          if (onSuccess) {
            setTimeout(() => {
              onSuccess();
              reset();
            }, 3000);
          }
        },
      });
    } catch (error) {
      console.error('Failed to execute reCAPTCHA:', error);
      // Only show error in production where reCAPTCHA is required
      const isProduction = import.meta.env.MODE === 'production';
      if (isProduction) {
        // In production, reCAPTCHA is required
        return;
      }
      // In development, continue without token
      forgotPasswordMutation.mutate({ ...data, recaptchaToken: '' }, {
        onSuccess: () => {
          if (onSuccess) {
            setTimeout(() => {
              onSuccess();
              reset();
            }, 3000);
          }
        },
      });
    }
  };

  return (
    <div className="mt-4 pt-4 border-t">
      {forgotPasswordMutation.isError && (
        <Alert variant="destructive" role="alert" aria-live="assertive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {forgotPasswordMutation.error instanceof Error
              ? forgotPasswordMutation.error.message
              : t('auth.forgotPassword.errors.failed')}
          </AlertDescription>
        </Alert>
      )}

      {forgotPasswordMutation.isSuccess && (
        <Alert variant="default" role="alert" aria-live="assertive" className="mb-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            {forgotPasswordMutation.data?.message || t('auth.forgotPassword.success')}
          </AlertDescription>
        </Alert>
      )}

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-4"
        noValidate
        aria-label={t('auth.forgotPassword.title')}
      >
        <div className="space-y-2">
          <Label htmlFor="forgot-email">
            {t('auth.forgotPassword.email')}
            <span className="text-destructive ml-1" aria-label={t('common.required')}>*</span>
          </Label>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder={t('auth.forgotPassword.emailPlaceholder')}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'forgot-email-error' : undefined}
            aria-required="true"
            {...register('email')}
            disabled={isSubmitting || forgotPasswordMutation.isPending}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p 
              id="forgot-email-error" 
              className="text-sm text-destructive flex items-center gap-1"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {t(errors.email.message || 'auth.forgotPassword.errors.invalidEmail')}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={isSubmitting || forgotPasswordMutation.isPending}
            aria-busy={isSubmitting || forgotPasswordMutation.isPending}
          >
            {isSubmitting || forgotPasswordMutation.isPending
              ? t('auth.forgotPassword.submitting')
              : t('auth.forgotPassword.submit')}
          </Button>
          <Button 
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || forgotPasswordMutation.isPending}
          >
            {t('auth.forgotPassword.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}

