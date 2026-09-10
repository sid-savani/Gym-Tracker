/**
 * Design System - Color Tokens
 * Quiet Premium: Dark-first Monochrome Athletic Palette
 */

export interface ThemeColors {
  background: {
    primary: string;
    surface: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  border: {
    default: string;
    subtle: string;
    focused: string;
    error: string;
  };
  action: {
    primary: {
      background: string;
      text: string;
      pressed: string;
    };
    secondary: {
      background: string;
      text: string;
      pressed: string;
    };
    destructive: {
      background: string;
      text: string;
      pressed: string;
    };
    disabled: {
      background: string;
      text: string;
    };
  };
  semantic: {
    success: string;
    successSurface: string;
    warning: string;
    warningSurface: string;
    destructive: string;
    destructiveSurface: string;
  };
  input: {
    background: string;
    border: string;
    borderFocused: string;
    borderError: string;
    placeholder: string;
    text: string;
    disabledBackground: string;
  };
}

export const lightColors: ThemeColors = {
  background: {
    primary: '#F7F7F5',
    surface: '#FFFFFF',
    elevated: '#F0F0EE',
  },
  text: {
    primary: '#171717',
    secondary: '#6F6F6F',
    tertiary: '#9A9A9A',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#E4E4E2',
    subtle: '#EBEBE9',
    focused: '#171717',
    error: '#CF3B3B',
  },
  action: {
    primary: {
      background: '#171717',
      text: '#FFFFFF',
      pressed: '#333333',
    },
    secondary: {
      background: '#EAEAE7',
      text: '#171717',
      pressed: '#DDDDD9',
    },
    destructive: {
      background: '#CF3B3B',
      text: '#FFFFFF',
      pressed: '#B82E2E',
    },
    disabled: {
      background: '#E4E4E2',
      text: '#9A9A9A',
    },
  },
  semantic: {
    success: '#2E7D32',
    successSurface: '#E8F5E9',
    warning: '#B25E00',
    warningSurface: '#FFF3E0',
    destructive: '#CF3B3B',
    destructiveSurface: '#FCE8E8',
  },
  input: {
    background: '#FFFFFF',
    border: '#E4E4E2',
    borderFocused: '#171717',
    borderError: '#CF3B3B',
    placeholder: '#9A9A9A',
    text: '#171717',
    disabledBackground: '#F0F0EE',
  },
};

export const darkColors: ThemeColors = {
  background: {
    primary: '#0D0D0D',
    surface: '#151515',
    elevated: '#1D1D1D',
  },
  text: {
    primary: '#F5F5F5',
    secondary: '#A0A0A0',
    tertiary: '#707070',
    inverse: '#0D0D0D',
  },
  border: {
    default: '#292929',
    subtle: '#1F1F1F',
    focused: '#F5F5F5',
    error: '#E5484D',
  },
  action: {
    primary: {
      background: '#F5F5F5',
      text: '#0D0D0D',
      pressed: '#D6D6D6',
    },
    secondary: {
      background: '#242424',
      text: '#F5F5F5',
      pressed: '#303030',
    },
    destructive: {
      background: '#E5484D',
      text: '#FFFFFF',
      pressed: '#C7383D',
    },
    disabled: {
      background: '#222222',
      text: '#555555',
    },
  },
  semantic: {
    success: '#4CAF50',
    successSurface: '#162819',
    warning: '#F1A153',
    warningSurface: '#2E1E0F',
    destructive: '#E5484D',
    destructiveSurface: '#2C1315',
  },
  input: {
    background: '#151515',
    border: '#292929',
    borderFocused: '#F5F5F5',
    borderError: '#E5484D',
    placeholder: '#707070',
    text: '#F5F5F5',
    disabledBackground: '#1D1D1D',
  },
};
