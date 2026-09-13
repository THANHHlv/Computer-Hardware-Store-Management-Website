import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createShopTheme } from './index';

interface ThemeModeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  setMode: (mode: 'light' | 'dark') => void;
}

const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

interface ThemeModeProviderProps {
  children: React.ReactNode;
}

export const ThemeModeProvider: React.FC<ThemeModeProviderProps> = ({ children }) => {
  const [mode, setModeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('pc_shop_theme_mode');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  const setMode = (newMode: 'light' | 'dark') => {
    setModeState(newMode);
    try {
      localStorage.setItem('pc_shop_theme_mode', newMode);
    } catch {}
    // Update data-theme on html element for css styling
    document.documentElement.setAttribute('data-theme', newMode);
  };

  const toggleTheme = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const activeTheme = useMemo(() => createShopTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme, setMode }}>
      <MuiThemeProvider theme={activeTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
};
