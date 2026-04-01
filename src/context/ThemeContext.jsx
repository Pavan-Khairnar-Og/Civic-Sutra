import { useState, useEffect } from 'react';

// Compatibility layer for the "Nuclear Option" dark mode
// This replaces the complex context with a simple hook that reads from document.documentElement
export const useTheme = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const handler = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    window.addEventListener('themechange', handler);
    return () => window.removeEventListener('themechange', handler);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const isCurrentlyDark = html.classList.contains('dark');
    if (isCurrentlyDark) {
      html.classList.remove('dark');
      html.removeAttribute('data-theme');
      localStorage.setItem('civicsutra_theme', 'light');
    } else {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('civicsutra_theme', 'dark');
    }
    window.dispatchEvent(new Event('themechange'));
  };

  return { isDark, isLight: !isDark, toggleTheme, theme: isDark ? 'dark' : 'light' };
};

// Dummy Provider for backward compatibility
export const ThemeProvider = ({ children }) => children;
