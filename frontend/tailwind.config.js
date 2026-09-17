/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#F7F1E8',
          200: '#EFE6D8',
          300: '#E5D8C8',
        },
        card: '#FFFDF8',
        dark: '#241F1A',
        muted: '#6E6257',
        terracotta: {
          DEFAULT: '#D85C3A',
          hover: '#C24D2C',
          light: '#F8E9E3',
        },
        warmbrown: {
          DEFAULT: '#8A5A44',
          light: '#ECE2DB',
          dark: '#5A382A',
        },
        sand: '#E5D8C8',
        success: {
          DEFAULT: '#3D7A5A',
          light: '#EAF3ED',
          border: '#B8D9C5',
        },
        danger: {
          DEFAULT: '#B93826',
          light: '#FCEFEB',
          border: '#F2BEB6',
        },
        warning: {
          DEFAULT: '#B57414',
          light: '#FCF5E8',
          border: '#EED7A1',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(36, 31, 26, 0.05)',
        'elevated': '0 10px 30px -4px rgba(36, 31, 26, 0.08)',
      },
    },
  },
  plugins: [],
}
