import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export function RegisterPage() {
  const { t } = useTranslation();

  return (
    <AuthLayout
      containerClassName="relative z-50 flex items-center justify-center p-4"
    >
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3" role="banner">
              <img
                src="/logo.png"
                alt={t("layout.appName")}
                className="h-12 w-auto object-contain"
                aria-hidden="true"
              />
              <h1 className="text-2xl font-bold text-white">
                {t("layout.appName")}
              </h1>
            </div>
          </div>

          <Card className="border" role="main" aria-labelledby="register-title">
            <CardHeader className="text-center">
              <CardTitle id="register-title" className="text-2xl">
                {t("auth.register.title") || "Crear cuenta"}
              </CardTitle>
              <CardDescription id="register-description">
                {t("auth.register.subtitle") || "Regístrate para comenzar"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <RegisterForm />
            </CardContent>
          </Card>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("auth.register.backToLogin") || "Volver al inicio de sesión"}
            </Link>
          </div>
        </div>
    </AuthLayout>
  );
}
