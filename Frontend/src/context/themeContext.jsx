import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize theme state (check localStorage first, then system preference)
  const [theme, setTheme] = useState(() => {
    // Only run this on client-side
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
    }
    return 'light'; // Default fallback
  });

  // THIS IS THE CRITICAL PART - applies theme to HTML element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Set the data-theme attribute
      document.documentElement.setAttribute('data-theme', theme);
      
      // 2. Persist to localStorage
      localStorage.setItem('theme', theme);
      
      // 3. Optional: Force CSS variable update (for some edge cases)
      const styles = getComputedStyle(document.documentElement);
      console.log('Current primary color:', styles.getPropertyValue('--p'));
    }
  }, [theme]); // Runs whenever theme changes

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);