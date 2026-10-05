/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // HostelBird brand palette — teal/green travel vibe
        brand: {
          50:  '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',  // primary
          600: '#0d9488',  // hover
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',  // orange CTA
          600: '#ea580c',
        },
        bird: {
          green:  '#14b8a6',
          orange: '#f97316',
          dark:   '#1a1a2e',
          card:   '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 2px 16px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px 0 rgba(0,0,0,0.14)',
        'booking': '0 4px 24px 0 rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
