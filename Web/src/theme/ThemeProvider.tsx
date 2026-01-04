import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from './types';

const DEFAULT_MODE: ThemeMode = 'light';
const STORAGE_KEY = 'app-theme-config';

interface ThemeProviderState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const initialState: ThemeProviderState = {
  mode: DEFAULT_MODE,
  setMode: () => {},
  toggleMode: () => {},
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Handle both old format { mode, color } and new format { mode }
        return (parsed.mode as ThemeMode) || DEFAULT_MODE;
      } catch (e) {
        console.error('Failed to parse theme mode from localStorage:', e);
      }
    }
    // Check system preference if no storage
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return DEFAULT_MODE;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode }));
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProviderContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
