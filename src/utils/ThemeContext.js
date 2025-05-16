import React, { createContext, useState, useContext, useEffect } from 'react';

// Define theme settings
const themes = {
  dark: {
    name: 'dark',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    accent: '#ff6b00', // Orange accent color
    editor: {
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      lineHighlight: '#282828',
      selection: 'rgba(255, 107, 0, 0.3)' // Semi-transparent orange selection
    },
    ui: {
      background: '#252526',
      foreground: '#cccccc',
      border: '#474747',
      hover: '#2a2d2e'
    }
  },
  light: {
    name: 'light',
    background: '#ffffff',
    foreground: '#333333',
    accent: '#ff6b00', // Orange accent color
    editor: {
      background: '#ffffff',
      foreground: '#333333',
      lineHighlight: '#f5f5f5',
      selection: 'rgba(181, 213, 255, 0.5)'
    },
    ui: {
      background: '#f3f3f3',
      foreground: '#333333',
      border: '#dadada',
      hover: '#e8e8e8'
    }
  },
  highContrast: {
    name: 'highContrast',
    background: '#000000',
    foreground: '#ffffff',
    accent: '#1aebff',
    editor: {
      background: '#000000',
      foreground: '#ffffff',
      lineHighlight: '#1f1f1f',
      selection: 'rgba(255, 255, 0, 0.5)'
    },
    ui: {
      background: '#000000',
      foreground: '#ffffff',
      border: '#6fc3df',
      hover: '#1f1f1f'
    }
  }
};

// Create the theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Get theme from local storage or use dark as default
  const [themeName, setThemeName] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme || 'dark';
  });

  // Get current theme object
  const currentTheme = themes[themeName] || themes.dark;

  // Apply theme to document
  useEffect(() => {
    document.documentElement.style.setProperty('--background', currentTheme.background);
    document.documentElement.style.setProperty('--foreground', currentTheme.foreground);
    document.documentElement.style.setProperty('--accent', currentTheme.accent);
    document.documentElement.style.setProperty('--editor-bg', currentTheme.editor.background);
    document.documentElement.style.setProperty('--editor-fg', currentTheme.editor.foreground);
    document.documentElement.style.setProperty('--editor-line', currentTheme.editor.lineHighlight);
    document.documentElement.style.setProperty('--editor-selection', currentTheme.editor.selection);
    document.documentElement.style.setProperty('--ui-bg', currentTheme.ui.background);
    document.documentElement.style.setProperty('--ui-fg', currentTheme.ui.foreground);
    document.documentElement.style.setProperty('--ui-border', currentTheme.ui.border);
    document.documentElement.style.setProperty('--ui-hover', currentTheme.ui.hover);
    
    // Save to local storage
    localStorage.setItem('theme', themeName);
  }, [themeName, currentTheme]);

  // Function to change theme
  const changeTheme = (newTheme) => {
    if (themes[newTheme]) {
      setThemeName(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, themeName, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
