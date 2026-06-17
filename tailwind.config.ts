import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#08080a',
          elevated: '#0e0e11',
        },
        ink: {
          DEFAULT: '#e8e6e3',
          muted: '#6b6b6f',
        },
        accent: {
          DEFAULT: '#e8b923',
          dim: '#c49a1a',
        },
        positive: '#2d9d78',
        negative: '#d64545',
        border: {
          DEFAULT: '#1c1c1f',
          rule: '#2a2a2e',
        },
        uber: '#276EF1',
        lyft: '#FF00BF',
        orange: '#FF9800',
        green: '#4CAF50',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        body: ['Source Sans 3', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
