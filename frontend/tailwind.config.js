/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './{app,pages,components}/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Professional formal color palette
        primary: {
          50: '#f8f9fb',
          100: '#f1f3f7',
          200: '#e3e7f1',
          300: '#d4dce8',
          400: '#b8c5d6',
          500: '#6b7c9e',
          600: '#5a6b8a',
          700: '#4a5a77',
          800: '#3a4a66',
          900: '#2d3a52',
        },
        secondary: {
          50: '#f8fbf9',
          100: '#f0f7f3',
          200: '#dceae2',
          300: '#b8d9ca',
          400: '#7fb39d',
          500: '#4a9070',
          600: '#3d7a5d',
          700: '#30634c',
          800: '#254d3b',
          900: '#1a372a',
        },
        accent: {
          50: '#f9faf8',
          100: '#f2f4f1',
          200: '#dfe5db',
          300: '#cbd5c4',
          400: '#a0b393',
          500: '#7a9265',
          600: '#667d52',
          700: '#536941',
          800: '#405430',
          900: '#2d3e23',
        },
        slate: {
          50: '#f8f9fa',
          100: '#f0f2f5',
          200: '#e1e5eb',
          300: '#d3d9e3',
          400: '#a8b3c1',
          500: '#7a8699',
          600: '#6b7589',
          700: '#5a6478',
          800: '#4a5368',
          900: '#3a4358',
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      fontFamily: {
        'sans': ['Segoe UI', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
