'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import en from '@/lib/translations/en.json';
import vi from '@/lib/translations/vi.json';
import ko from '@/lib/translations/ko.json';

export type Language = 'en' | 'vi' | 'ko';

interface TranslateOptions {
  returnObjects?: boolean;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: {
    (key: string): string;
    (key: string, options: { returnObjects: true }): string[];
  };
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, any> = {
  en,
  vi,
  ko,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get saved language from localStorage
    const savedLanguage = localStorage.getItem('hdpedu-language') as Language | null;
    if (savedLanguage && ['en', 'vi', 'ko'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('hdpedu-language', lang);
  };

  const t = ((key: string, options?: TranslateOptions): string | string[] => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value === 'string') {
      return value;
    }

    if (options?.returnObjects && Array.isArray(value)) {
      return value;
    }

    return key;
  }) as LanguageContextType['t'];

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    // Return default values during SSR
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: ((key: string) => key) as LanguageContextType['t'],
    };
  }
  return context;
};
