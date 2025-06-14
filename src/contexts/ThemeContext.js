'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { getThemePreference, updateThemePreference } from '../services/settingsService';

// Create the context
const ThemeContext = createContext();

// Create a provider component
export const ThemeProvider = ({ children }) => {
  const [themeSettings, setThemeSettings] = useState({
    theme: 'light',
    accentColor: 'blue',
    fontSize: 'medium',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the theme settings on initial render
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        // Try to get the theme settings from the API
        const themeData = await getThemePreference();

        if (themeData) {
          // Update the theme settings with the data from the API
          setThemeSettings(prevSettings => ({
            ...prevSettings,
            theme: themeData.themePreference || prevSettings.theme
          }));

          // Apply the theme to the document
          applyTheme(themeData.themePreference || 'light');
        }
      } catch (err) {
        console.error('Error loading theme settings:', err);
        setError(err.message);

        // Apply default theme if there's an error
        applyTheme('light');
      } finally {
        setLoading(false);
      }
    };

    loadThemeSettings();
  }, []);

  // Apply theme to the document
  const applyTheme = (theme) => {
    // If theme is 'system', check system preference
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  // Update theme settings
  const updateTheme = async (newThemeSettings) => {
    try {
      // Update local state
      setThemeSettings(prevSettings => ({
        ...prevSettings,
        ...newThemeSettings
      }));

      // Apply the theme
      applyTheme(newThemeSettings.theme || themeSettings.theme);

      // Save to API
      if (newThemeSettings.theme) {
        await updateThemePreference({
          theme: newThemeSettings.theme
        });
      }

      return true;
    } catch (err) {
      console.error('Error updating theme settings:', err);
      setError(err.message);
      return false;
    }
  };

  // Listen for system theme changes if using system theme
  useEffect(() => {
    if (themeSettings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e) => {
        applyTheme('system');
      };

      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [themeSettings.theme]);

  // The value that will be provided to consumers of this context
  const value = {
    themeSettings,
    loading,
    error,
    updateTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;