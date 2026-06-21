'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Palette } from 'lucide-react';

type SiteMode = 'darkmode1' | 'lightmode1' | 'darkmode2' | 'lightmode2';

interface SiteModeContextValue {
  mode: SiteMode;
  setMode: (mode: SiteMode) => void;
  cycleMode: () => void;
}

export function getSiteModeCssVariables(mode: SiteMode): Record<string, string> {
  return MODE_CSS_VARIABLES[mode];
}

export type { SiteMode };

const MODE_SEQUENCE: SiteMode[] = ['darkmode1', 'lightmode1', 'darkmode2', 'lightmode2'];
const STORAGE_KEY = 'hdp-site-mode';

const MODE_CSS_VARIABLES: Record<SiteMode, Record<string, string>> = {
  darkmode1: {
    '--background': '#0a0e27',
    '--foreground': '#e0e7ff',
    '--card': '#141829',
    '--card-foreground': '#e0e7ff',
    '--popover': '#0a0e27',
    '--popover-foreground': '#e0e7ff',
    '--primary': '#00d9ff',
    '--primary-foreground': '#0a0e27',
    '--secondary': '#0066ff',
    '--secondary-foreground': '#e0e7ff',
    '--muted': '#1e2749',
    '--muted-foreground': '#8892b0',
    '--accent': '#00d9ff',
    '--accent-foreground': '#0a0e27',
    '--border': '#1e2749',
    '--input': '#141829',
    '--ring': '#00d9ff',
  },
  lightmode1: {
    '--background': '#fffaf0',
    '--foreground': '#000000',
    '--card': '#fffdf9',
    '--card-foreground': '#000000',
    '--popover': '#fffaf0',
    '--popover-foreground': '#000000',
    '--primary': '#a62a26',
    '--primary-foreground': '#fffaf0',
    '--secondary': '#7a1f1c',
    '--secondary-foreground': '#ffffff',
    '--muted': '#f4eadf',
    '--muted-foreground': '#000000',
    '--accent': '#a62a26',
    '--accent-foreground': '#ffffff',
    '--border': '#e5d7c5',
    '--input': '#ffffff',
    '--ring': '#a62a26',
  },
  darkmode2: {
    '--background': '#101318',
    '--foreground': '#f3f5f7',
    '--card': '#1b2028',
    '--card-foreground': '#f3f5f7',
    '--popover': '#101318',
    '--popover-foreground': '#f3f5f7',
    '--primary': '#7dd3fc',
    '--primary-foreground': '#0b1117',
    '--secondary': '#60a5fa',
    '--secondary-foreground': '#f8fafc',
    '--muted': '#232a34',
    '--muted-foreground': '#cbd5e1',
    '--accent': '#f59e0b',
    '--accent-foreground': '#0b1117',
    '--border': '#334155',
    '--input': '#1b2028',
    '--ring': '#7dd3fc',
  },
  lightmode2: {
    '--background': '#ffffff',
    '--foreground': '#000000',
    '--card': '#ffffff',
    '--card-foreground': '#000000',
    '--popover': '#ffffff',
    '--popover-foreground': '#000000',
    '--primary': '#a62a26',
    '--primary-foreground': '#ffffff',
    '--secondary': '#7a1f1c',
    '--secondary-foreground': '#ffffff',
    '--muted': '#f7f3f2',
    '--muted-foreground': '#000000',
    '--accent': '#a62a26',
    '--accent-foreground': '#ffffff',
    '--border': '#e8d3d1',
    '--input': '#ffffff',
    '--ring': '#a62a26',
  },
};

const SiteModeContext = createContext<SiteModeContextValue | null>(null);

export const useSiteMode = (): SiteModeContextValue => {
  const context = useContext(SiteModeContext);
  if (!context) {
    throw new Error('useSiteMode must be used within SiteModeProvider');
  }
  return context;
};

export const SiteModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<SiteMode>('darkmode1');

  useEffect(() => {
    const storedMode = window.localStorage.getItem(STORAGE_KEY) as SiteMode | null;
    if (storedMode && MODE_SEQUENCE.includes(storedMode)) {
      setMode(storedMode);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const cycleMode = () => {
    setMode((prevMode) => {
      const currentIndex = MODE_SEQUENCE.indexOf(prevMode);
      return MODE_SEQUENCE[(currentIndex + 1) % MODE_SEQUENCE.length];
    });
  };

  const cssVariableStyle = useMemo(
    () => MODE_CSS_VARIABLES[mode] as React.CSSProperties,
    [mode]
  );

  const value = useMemo(
    () => ({ mode, setMode, cycleMode }),
    [mode]
  );

  return (
    <SiteModeContext.Provider value={value}>
      <div className={`site-mode-${mode} relative min-h-screen`} data-site-mode={mode} style={cssVariableStyle}>
        {children}

        <button
          type="button"
          onClick={cycleMode}
          className="fixed bottom-6 left-6 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card/95 text-foreground shadow-lg backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-primary"
          aria-label="Change site visual mode"
          title="Change theme"
        >
          <Palette className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </SiteModeContext.Provider>
  );
};
