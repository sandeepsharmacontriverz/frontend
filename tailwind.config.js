/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  theme: {
    extend: {
      keyframes: {
        'bounce-pulse': {
          '0%, 100%': { transform: 'translateY(-25%)', opacity: 1 },
          '50%': { transform: 'translateY(0)', opacity: 0.5 },
        },
      },
      animation: {
        'bounce-pulse': 'bounce-pulse 1s infinite',
      },
    },
  },
  plugins: [],
}
