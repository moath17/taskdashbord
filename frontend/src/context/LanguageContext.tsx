'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en, ar, TranslationKeys } from '../locales';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isRTL: boolean;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, TranslationKeys> = {
  en,
  ar,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load language from localStorage after hydration
  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'ar' || saved === 'en') {
      setLanguageState(saved);
    }
    setIsHydrated(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const isRTL = language === 'ar';
  const t = translations[language];

  // Update document direction and lang attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
      
      // Add RTL class to body for additional styling if needed
      if (isRTL) {
        document.body.classList.add('rtl');
        document.body.style.fontFamily = 'Tahoma, Arial, sans-serif';
      } else {
        document.body.classList.remove('rtl');
        document.body.style.fontFamily = '';
      }
    }
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
