import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRegister } from "@/hooks/auth/use-auth";
import { useTenants } from "@/hooks/tenants/use-tenants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { AuthDivider } from "@/components/auth/auth-divider";

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "auth.register.errors.emailRequired")
      .email("auth.register.errors.invalidEmail"),
    password: z
      .string()
      .min(8, "auth.register.errors.passwordMinLength")
      .min(1, "auth.register.errors.passwordRequired"),
    confirmPassword: z
      .string()
      .min(1, "auth.register.errors.confirmPasswordRequired"),
    name: z.string().optional(),
    tenant_id: z.string().min(1, "auth.register.errors.tenantRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth.register.errors.passwordsDoNotMatch",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { t } = useTranslation();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { executeRecaptchaAction } = useRecaptcha();

  // Fetch tenants
  const tenants = useTenants();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Execute reCAPTCHA before submitting (returns empty string in development)
      const recaptchaToken = await executeRecaptchaAction("register");
      // In development, token can be empty - backend will handle it
      registerMutation.mutate({
        email: data.email,
        password: data.password,
        name: data.name,
        tenant_id: data.tenant_id,
        recaptchaToken,
      });
    } catch (error) {
      console.error("Failed to execute reCAPTCHA:", error);
      // Only show error in production where reCAPTCHA is required
      const isProduction = import.meta.env.MODE === "production";
      if (isProduction) {
        // In production, reCAPTCHA is required
        return;
      }
      // In development, continue without token
      registerMutation.mutate({
        email: data.email,
        password: data.password,
        name: data.name,
        tenant_id: data.tenant_id,
        recaptchaToken: "",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      {registerMutation.isError && (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {registerMutation.error instanceof Error
              ? registerMutation.error.message
              : t("auth.register.errors.registerFailed") ||
                "Error al registrar"}
          </AlertDescription>
        </Alert>
      )}
      <AuthDivider />
      <GoogleAuthButton disabled={registerMutation.isPending} />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
        aria-label={t("auth.register.title") || "Formulario de registro"}
      >
        <div className="space-y-2">
          <Label htmlFor="name">{t("auth.register.name")}</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder={t("auth.register.namePlaceholder")}
            aria-invalid={errors.name ? "true" : "false"}
            {...register("name")}
            disabled={isSubmitting || registerMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenant_id">
            {t("auth.register.tenant")}
            <span
              className="text-destructive ml-1"
              aria-label={t("common.required")}
            >
              *
            </span>
          </Label>
          <Controller
            name="tenant_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting || registerMutation.isPending}
              >
                <SelectTrigger
                  id="tenant_id"
                  aria-invalid={errors.tenant_id ? "true" : "false"}
                  aria-describedby={
                    errors.tenant_id ? "tenant-error" : undefined
                  }
                  aria-required="true"
                  className={errors.tenant_id ? "border-destructive" : ""}
                >
                  <SelectValue
                    placeholder={t("auth.register.tenantPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.tenant_id && (
            <p
              id="tenant-error"
              className="text-sm text-destructive flex items-center gap-1"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {t(
                errors.tenant_id.message ||
                  "auth.register.errors.tenantRequired"
              )}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            {t("auth.register.email") || "Email"}
            <span className="text-destructive ml-1" aria-label="requerido">
              *
            </span>
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("auth.register.emailPlaceholder") || "tu@email.com"}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-required="true"
            {...register("email")}
            disabled={isSubmitting || registerMutation.isPending}
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
              {t(errors.email.message || "auth.register.errors.invalidEmail")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            {t("auth.register.password") || "Contraseña"}
            <span className="text-destructive ml-1" aria-label="requerido">
              *
            </span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={
                t("auth.register.passwordPlaceholder") || "Mínimo 8 caracteres"
              }
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
              aria-required="true"
              {...register("password")}
              disabled={isSubmitting || registerMutation.isPending}
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={togglePasswordVisibility}
              disabled={isSubmitting || registerMutation.isPending}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              aria-pressed={showPassword}
              aria-controls="password"
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
                errors.password.message ||
                  "auth.register.errors.passwordMinLength"
              )}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            {t("auth.register.confirmPassword") || "Confirmar contraseña"}
            <span className="text-destructive ml-1" aria-label="requerido">
              *
            </span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={
                t("auth.register.confirmPasswordPlaceholder") ||
                "Repite tu contraseña"
              }
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              aria-describedby={
                errors.confirmPassword ? "confirm-password-error" : undefined
              }
              aria-required="true"
              {...register("confirmPassword")}
              disabled={isSubmitting || registerMutation.isPending}
              className={
                errors.confirmPassword ? "border-destructive pr-10" : "pr-10"
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={toggleConfirmPasswordVisibility}
              disabled={isSubmitting || registerMutation.isPending}
              aria-label={
                showConfirmPassword
                  ? "Ocultar confirmación de contraseña"
                  : "Mostrar confirmación de contraseña"
              }
              aria-pressed={showConfirmPassword}
              aria-controls="confirmPassword"
            >
              {showConfirmPassword ? (
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
          </div>
          {errors.confirmPassword && (
            <p
              id="confirm-password-error"
              className="text-sm text-destructive flex items-center gap-1"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {t(
                errors.confirmPassword.message ||
                  "auth.register.errors.passwordsDoNotMatch"
              )}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || registerMutation.isPending}
          aria-busy={isSubmitting || registerMutation.isPending}
        >
          {isSubmitting || registerMutation.isPending
            ? t("auth.register.submitting") || "Registrando..."
            : t("auth.register.submit") || "Registrarse"}
        </Button>
      </form>
      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          {t("auth.register.alreadyHaveAccount") || "¿Ya tienes una cuenta?"}{" "}
          <Link
            to="/login"
            className="text-primary hover:underline font-medium"
          >
            {t("auth.register.loginLink") || "Inicia sesión"}
          </Link>
        </p>
      </div>
    </div>
  );
}
