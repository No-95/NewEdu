'use client';

import { useLanguage } from '@/lib/context/LanguageContext';
import { useEffect, useState } from 'react';

export const useSafeLanguage = () => {
  const context = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    ...context,
    mounted,
  };
};
