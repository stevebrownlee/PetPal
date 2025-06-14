'use client';

import { Theme } from '@radix-ui/themes';
import { useTheme } from '../contexts/ThemeContext';

// This component consumes the ThemeContext and renders the Theme component with the appropriate settings
export default function ThemeConsumer({ children }) {
  const { themeSettings, loading } = useTheme();

  // Default theme settings if still loading
  const appearance = loading ? 'light' : themeSettings.theme === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : themeSettings.theme;

  const accentColor = loading ? 'blue' : themeSettings.accentColor;

  return (
    <Theme appearance={appearance} accentColor={accentColor} radius="medium">
      {children}
    </Theme>
  );
}