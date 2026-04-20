import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'jeopardy-blue': '#060CE9',
        'jeopardy-blue-dark': '#0B1E7C',
        'jeopardy-gold': '#D69F4C',
        'jeopardy-gold-bright': '#FFCC00',
      },
      dropShadow: {
        jeopardy: '0 2px 0 #000',
      },
    },
  },
  plugins: [],
};

export default config;
