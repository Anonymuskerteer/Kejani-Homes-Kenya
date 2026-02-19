import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: 'hsl(210, 89%, 43%)', // Blue - trustworthy blue
          foreground: 'hsl(210, 40%, 98%)', // White text on primary background
          hover: 'hsl(210, 89%, 38%)',
        },
        'secondary': {
          DEFAULT: 'hsl(35, 91%, 55%)', // A vibrant, warm accent
          foreground: 'hsl(35, 91%, 15%)', // Dark text on secondary background
          hover: 'hsl(35, 91%, 50%)',
        },
        'light': 'hsl(210, 40%, 98%)', // Light text for dark mode
        'dark': 'hsl(222, 47%, 11%)',  // Dark text for light mode
        
        // Light Mode Defaults
        'background': 'hsl(0, 0%, 100%)',
        'foreground': 'hsl(220, 13%, 91%)',
        'muted': 'hsl(215, 20%, 65%)',
        'border': 'hsl(214, 32%, 91%)',

        // Dark Mode Defaults
        'dark-background': 'hsl(222, 47%, 11%)', // Deep, dark navy/charcoal
        'dark-foreground': 'hsl(222, 47%, 18%)',
        'dark-muted': 'hsl(215, 20%, 45%)',
        'dark-border': 'hsl(217, 33%, 25%)',

        // Text colors with dark mode support
        'text-primary': 'hsl(222, 47%, 11%)',
        'text-secondary': 'hsl(215, 20%, 45%)',
        
        // Accent color for stars/ratings
        'accent': {
          DEFAULT: 'hsl(35, 91%, 55%)',
          foreground: 'hsl(35, 91%, 15%)',
        },

        // Status Colors
        'success': {
          DEFAULT: '#22C55E',
          foreground: '#FFFFFF',
          hover: '#16A34A',
        },
        'error': {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
          hover: '#DC2626',
        },
        'warning': {
          DEFAULT: '#F59E0B',
          foreground: '#FFFFFF',
          hover: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
}
