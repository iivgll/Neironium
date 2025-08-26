// Removed mode import since we're using dark theme only
export const globalStyles = {
  colors: {
    // Neuronium AI Design System Colors
    neuronium: {
      background: {
        primary: '#1e1e1e', // Background/grafit
        secondary: '#343434', // Main/gray
        tertiary: '#2a2a2a',
        hover: 'rgba(255, 255, 255, 0.05)',
        active: 'rgba(255, 255, 255, 0.1)',
      },
      text: {
        primary: '#ffffff', // Text/white
        secondary: '#8a8b8c', // Text/gray
        tertiary: '#8c8c8c', // Labels
      },
      button: {
        violet: '#8854f3', // Button/violet
        white: '#ffffff', // Button/white
        gray: '#343434', // Button/gray
      },
      border: {
        primary: '#343434',
        secondary: 'rgba(255, 255, 255, 0.1)',
      },
      accent: {
        violet: '#8854f3',
        purple: '#A259FF',
        pink: '#FF5757',
        blue: '#5865F2',
        green: '#57F287',
        yellow: '#FEE75C',
        orange: '#EB7C4C',
        red: '#ED4245',
      },
      tags: {
        health: '#53D769',
        education: '#FF9500',
        productivity: '#007AFF',
        personalGoals: '#AF52DE',
        development: '#00C7BE',
        relationships: '#FF2D55',
      }
    },
    // Legacy colors for compatibility
    brand: {
      100: '#E9E3FF',
      200: '#8854f3',
      300: '#8854f3',
      400: '#A259FF',
      500: '#8854f3',
      600: '#7B3FF2',
      700: '#6525D3',
      800: '#5421A6',
      900: '#3E1878',
    },
    secondaryGray: {
      100: '#2a2a2a',
      200: '#343434',
      300: '#3a3a3a',
      400: '#4a4a4a',
      500: '#8a8b8c',
      600: '#8c8c8c',
      700: '#9a9a9a',
      800: '#aaaaaa',
      900: '#1e1e1e',
    },
    red: {
      100: '#FEEFEE',
      500: '#ED4245',
      600: '#E31A1A',
    },
    blue: {
      50: '#EFF4FB',
      500: '#5865F2',
    },
    orange: {
      100: '#FFF6DA',
      500: '#EB7C4C',
    },
    green: {
      100: '#E6FAF5',
      500: '#57F287',
    },
    white: {
      50: '#ffffff',
      100: '#ffffff',
      200: '#ffffff',
      300: '#ffffff',
      400: '#ffffff',
      500: '#ffffff',
      600: '#ffffff',
      700: '#ffffff',
      800: '#ffffff',
      900: '#ffffff',
    },
    navy: {
      50: '#3a3a3a',
      100: '#343434',
      200: '#2a2a2a',
      300: '#252525',
      400: '#222222',
      500: '#202020',
      600: '#1f1f1f',
      700: '#1e1e1e',
      800: '#1a1a1a',
      900: '#151515',
    },
    gray: {
      100: '#FAFCFE',
    },
  },
  styles: {
    global: () => ({
      body: {
        overflowX: 'hidden',
        bg: 'linear-gradient(180deg, #151515 0%, #1a1a1a 100%)', // Dark gradient background
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        color: '#ffffff', // Force white text always
        minHeight: '100vh',
      },
      input: {
        color: '#ffffff', // Force white input text always
      },
      html: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        bg: '#151515', // Force dark background always
      },
      '#root': {
        bg: '#151515', // Force dark background for root element
      },
    }),
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false, // Disable system color mode detection
  },
};
