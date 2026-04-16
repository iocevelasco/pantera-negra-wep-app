import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // Normalizar el idioma actual para mostrar el valor correcto en el selector
  // Si es "es" o "es-AR", mostrar "es-AR"
  // Si es "pt" o "pt-BR", mostrar "pt-BR"
  const currentLanguage = i18n.language.startsWith('es')
    ? 'es-AR'
    : i18n.language.startsWith('pt')
      ? 'pt-BR'
      : 'es-AR';

  return (
    <Select value={currentLanguage} onValueChange={changeLanguage}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Idioma" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="es-AR">🇦🇷 Español (Argentina)</SelectItem>
        <SelectItem value="pt-BR">🇧🇷 Português (Brasil)</SelectItem>
      </SelectContent>
    </Select>
  );
}

