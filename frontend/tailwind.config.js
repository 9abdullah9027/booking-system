/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // UrbanNest Blue
          dark: '#1D4ED8',
          light: '#93C5FD'
        },
        secondary: '#0F172A', // Dark Sidebar
        bgMain: '#F8FAFC',    // Light Gray Background
        surface: '#FFFFFF',   // Card White
        dark: '#1E293B',      // Text Headings
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}