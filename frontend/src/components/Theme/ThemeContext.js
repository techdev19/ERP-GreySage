import React from 'react';

const ThemeContext = React.createContext({
  toggleDarkMode: () => {},
  setVariant: () => {},
});

export const ThemeProvider = ThemeContext.Provider;
export const useThemeContext = () => React.useContext(ThemeContext);