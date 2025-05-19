/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-purple': {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        'theme-black': {
          50: '#f9fafb',
          100: '#f4f5f7',
          200: '#e5e7eb',
          300: '#d2d6dc',
          400: '#9fa6b2',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0f0f1a',
        },
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      backgroundImage: {
        'purple-gradient': 'linear-gradient(45deg, #6b46c1, #9f7aea, #805ad5, #553c9a)',
        'dark-gradient': 'linear-gradient(to bottom, #0f0f1a, #1a1a2e)',
      },
      boxShadow: {
        'purple-glow': '0 0 15px rgba(139, 92, 246, 0.5)',
        'purple-neon': '0 0 10px rgba(139, 92, 246, 0.7), 0 0 20px rgba(139, 92, 246, 0.4), 0 0 30px rgba(139, 92, 246, 0.2)',
        'purple-pulse': '0 0 5px rgba(139, 92, 246, 0.5), 0 0 15px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [],
}

