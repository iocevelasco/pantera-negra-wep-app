import { useTranslation } from 'react-i18next';

interface AuthDividerProps {
  className?: string;
}

export function AuthDivider({ className }: AuthDividerProps) {
  const { t } = useTranslation();

  return (
    <div className={`relative ${className || ''}`}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">
          {t('auth.login.orContinueWith')}
        </span>
      </div>
    </div>
  );
}

