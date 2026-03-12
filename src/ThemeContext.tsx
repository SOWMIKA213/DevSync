import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSettings } from './types';

interface ThemeContextType {
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('devsync-settings');
    return saved ? JSON.parse(saved) : {
      theme: 'dark',
      fontSize: 14,
      fontFamily: "'JetBrains Mono', monospace"
    };
  });

  useEffect(() => {
    localStorage.setItem('devsync-settings', JSON.stringify(settings));
    document.body.className = settings.theme === 'dark' ? 'dark bg-purple-950 text-white' : 'light bg-gray-50 text-gray-900';
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
  }, [settings]);

  return (
    <ThemeContext.Provider value={{ settings, setSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
