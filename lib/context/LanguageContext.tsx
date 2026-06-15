'use client';

import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import en from '@/lib/translations/en.json';
import vi from '@/lib/translations/vi.json';
import ko from '@/lib/translations/ko.json';
import ecosystemEn from '@/lib/translations/ecosystem/en.json';
import ecosystemVi from '@/lib/translations/ecosystem/vi.json';
import ecosystemKo from '@/lib/translations/ecosystem/ko.json';
import booksEn from '@/lib/translations/books/en.json';
import booksVi from '@/lib/translations/books/vi.json';
import booksKo from '@/lib/translations/books/ko.json';

export type Language = 'en' | 'vi' | 'ko';

interface TranslateOptions {
  returnObjects?: boolean;
  params?: Record<string, string | number>;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: {
    (key: string, options?: TranslateOptions): string;
    (key: string, options: { returnObjects: true } & TranslateOptions): string[];
  };
}

function interpolate(text: string, params?: Record<string, string | number>) {
  if (!params) return text;
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    text
  );
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, any> = {
  en: { ...en, ecosystemPages: ecosystemEn, booksPage: booksEn },
  vi: { ...vi, ecosystemPages: ecosystemVi, booksPage: booksVi },
  ko: { ...ko, ecosystemPages: ecosystemKo, booksPage: booksKo },
};

function createTranslateFunction(language: Language): LanguageContextType['t'] {
  return ((key: string, options?: TranslateOptions): string | string[] => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return options?.returnObjects ? [] : key;
      }
    }

    if (typeof value === 'string') {
      return interpolate(value, options?.params);
    }

    if (options?.returnObjects && Array.isArray(value)) {
      return value.map((item) =>
        typeof item === 'string' ? interpolate(item, options?.params) : item
      );
    }

    return options?.returnObjects ? [] : key;
  }) as LanguageContextType['t'];
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('hdpedu-language') as Language | null;
    if (savedLanguage && ['en', 'vi', 'ko'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('hdpedu-language', lang);
  };

  const t = useMemo(() => createTranslateFunction(language), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: createTranslateFunction('en'),
    };
  }
  return context;
};
