import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [ 'var(--font-lato)' ],
        playfair: [ 'var(--font-playfair)' ]
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        calypso: {
          50: '#eefbfd',
          100: '#d4f4f9',
          200: '#aee8f3',
          300: '#76d6ea',
          400: '#36bada',
          500: '#1b9dbf',
          600: '#197fa1',
          DEFAULT: '#1c6a88',
          800: '#1f546b',
          900: '#1e475b',
          950: '#0e2d3e'
        }
      }
    }
  },
  plugins: []
};
export default config;
