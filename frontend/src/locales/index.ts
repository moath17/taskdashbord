import { ar } from './ar';
import { en } from './en';

export type Language = 'ar' | 'en';
export type Translations = typeof en;

export const translations: Record<Language, Translations> = { ar, en };

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export { ar, en };
