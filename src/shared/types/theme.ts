export interface ThemeColors {
  // Base colors
  background: string;
  text: string;
  textMuted: string;
  link: string;
  
  // Button colors
  buttonBackground: string;
  buttonText: string;
  buttonBackgroundSecondary: string;
  buttonTextSecondary: string;
  
  // Card colors
  cardBackground: string;
  cardBackgroundSecondary: string;
  cardText: string;
  cardTextSecondary: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border colors
  border: string;
  borderFocus: string;
  
  // Overlay colors
  overlay: string;
  overlayDark: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  zIndex: {
    modal: number;
    dropdown: number;
    tooltip: number;
    toast: number;
  };
}
