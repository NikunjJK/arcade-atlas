import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#f8fafc',
        line: '#e5e7eb'
      },
      boxShadow: {
        soft: '0 18px 50px -24px rgba(15, 23, 42, 0.28)'
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top, rgba(99, 102, 241, 0.16), transparent 30%), radial-gradient(circle at right, rgba(16, 185, 129, 0.14), transparent 25%)'
      }
    }
  },
  plugins: []
};

export default config;
