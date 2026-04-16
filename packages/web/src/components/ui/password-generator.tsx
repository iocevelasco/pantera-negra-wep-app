import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
}

export function PasswordGenerator({
  onPasswordGenerated,
  length = 12,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true,
  includeSymbols = true,
}: PasswordGeneratorProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = '';
    if (includeUppercase) charset += uppercase;
    if (includeLowercase) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (charset === '') {
      toast.error(t('passwordGenerator.noOptions'));
      return;
    }

    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }

    setPassword(generatedPassword);
    onPasswordGenerated?.(generatedPassword);
  };

  const copyToClipboard = async () => {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success(t('passwordGenerator.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t('passwordGenerator.copyError'));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            readOnly
            value={password}
            placeholder={t('passwordGenerator.placeholder')}
            className="w-full px-3 py-2 pr-24 border rounded-md bg-background text-sm font-mono"
          />
          {password && (
            <Button
              type="button"
              variant={copied ? "default" : "outline"}
              size="sm"
              className={`absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 gap-1.5 text-xs ${
                copied ? 'bg-green-500 hover:bg-green-600 text-white' : ''
              }`}
              onClick={copyToClipboard}
              title={t('passwordGenerator.copy')}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>{t('passwordGenerator.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t('passwordGenerator.copy')}</span>
                </>
              )}
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={generatePassword}
          title={t('passwordGenerator.generate')}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

