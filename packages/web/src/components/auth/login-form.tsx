import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useLogin } from "@/hooks/auth/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { GoogleAuthButton } from "./google-auth-button";
import { AuthDivider } from "./auth-divider";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "auth.login.errors.emailRequired")
    .email("auth.login.errors.invalidEmail"),
  password: z.string().min(1, "auth.login.errors.passwordRequired"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onForgotPasswordClick: () => void;
}

export function LoginFormFields({ onForgotPasswordClick }: LoginFormProps) {
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const { executeRecaptchaAction } = useRecaptcha();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Execute reCAPTCHA before submitting (returns empty string in development)
      const recaptchaToken = await executeRecaptchaAction("login");
      // In development, token can be empty - backend will handle it
      loginMutation.mutate({ ...data, recaptchaToken });
    } catch (error) {
      console.error("Failed to execute reCAPTCHA:", error);
      // Only show error in production where reCAPTCHA is required
      const isProduction = import.meta.env.MODE === "production";
      if (isProduction) {
        // In production, reCAPTCHA is required
        return;
      }
      // In development, continue without token
      loginMutation.mutate({ ...data, recaptchaToken: "" });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      {loginMutation.isError && (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {loginMutation.error instanceof Error
              ? loginMutation.error.message
              : t("auth.login.errors.loginFailed")}
          </AlertDescription>
        </Alert>
      )}

      <GoogleAuthButton disabled={loginMutation.isPending} />
      <AuthDivider />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
        aria-label={t("auth.login.title")}
      >
        <div className="space-y-2">
          <Label htmlFor="email">
            {t("auth.login.email")}
            <span
              className="text-destructive ml-1"
              aria-label={t("common.required")}
            >
              *
            </span>
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("auth.login.emailPlaceholder")}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-required="true"
            {...register("email")}
            disabled={isSubmitting || loginMutation.isPending}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p
              id="email-error"
              className="text-sm text-destructive flex items-center gap-1"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {t(errors.email.message || "auth.login.errors.invalidEmail")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            {t("auth.login.password")}
            <span
              className="text-destructive ml-1"
              aria-label={t("common.required")}
            >
              *
            </span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={t("auth.login.passwordPlaceholder")}
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={
                errors.password
                  ? "password-error"
                  : "password-toggle-description"
              }
              aria-required="true"
              {...register("password")}
              disabled={isSubmitting || loginMutation.isPending}
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={togglePasswordVisibility}
              disabled={isSubmitting || loginMutation.isPending}
              aria-label={
                showPassword
                  ? t("auth.login.hidePassword")
                  : t("auth.login.showPassword")
              }
              aria-pressed={showPassword}
              aria-controls="password"
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : (
                <Eye
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </Button>
            <span id="password-toggle-description" className="sr-only">
              {showPassword
                ? t("auth.login.hidePassword")
                : t("auth.login.showPassword")}
            </span>
          </div>
          {errors.password && (
            <p
              id="password-error"
              className="text-sm text-destructive flex items-center gap-1"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {t(
                errors.password.message || "auth.login.errors.passwordRequired"
              )}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-sm text-primary hover:underline"
            disabled={isSubmitting || loginMutation.isPending}
          >
            {t("auth.login.forgotPassword")}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || loginMutation.isPending}
          aria-busy={isSubmitting || loginMutation.isPending}
        >
          {isSubmitting || loginMutation.isPending
            ? t("auth.login.submitting")
            : t("auth.login.submit")}
        </Button>
      </form>
    </div>
  );
}
