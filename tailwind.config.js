/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C3CE1',
        secondary: '#00D4AA',
        dark: '#0A0A1A',
        card: '#1A1A2E',
        cardHover: '#2A2A4E',
        accent: '#FF6B6B',
        success: '#00D4AA',
        danger: '#FF6B6B',
        warning: '#FFD93D',
        gold: '#FFD700',
      },
    },
  },
  plugins: [],
}
