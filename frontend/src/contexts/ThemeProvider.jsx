import { createContext, useContext, useEffect, useState } from 'react';

const ThemeProviderContext = createContext();

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'vite-ui-theme' }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) || defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let systemTheme = theme;
    if (theme === 'system') {
      systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.add(systemTheme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey, defaultTheme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
