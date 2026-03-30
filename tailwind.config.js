/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF3B30',
        secondary: '#FFD600',
        accent: '#1A1A2E',
        surface: '#0F0F1A',
        card: '#1E1E30',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0B0C8',
        success: '#34C759',
        warning: '#FF9500',
        'brand-orange': '#FF9500',
      },
      fontFamily: {
        display: ['Righteous', 'Fredoka One', 'cursive'],
        body: ['Nunito', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'bubble-gradient': 'linear-gradient(135deg, #FF3B30, #FF9500, #FFD600)',
        'card-gradient': 'linear-gradient(145deg, #1E1E30, #252540)',
        'hero-gradient': 'linear-gradient(180deg, #0F0F1A 0%, #1A1A2E 100%)',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      boxShadow: {
        'brand': '0 0 30px rgba(255, 59, 48, 0.3)',
        'brand-yellow': '0 0 30px rgba(255, 214, 0, 0.3)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(255, 59, 48, 0.5)',
      },
    },
  },
  plugins: [],
}