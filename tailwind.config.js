/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // ← Asegúrate que incluya .jsx
  ],
  darkMode: 'class', // ✅ Clave: activado por clase
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        dark: '#1F2937',
      },
    },
  },
  plugins: [],
}