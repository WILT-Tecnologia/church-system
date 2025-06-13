/** @type {import('tailwindcss').Config} */

const config = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',
    './src/app/**/*.{html,js,ts,jsx,tsx,mdx}',
    './src/app/components/**/*.{html,js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
    screens: {
      sm: { max: '640px' },
      md: { max: '768px' },
      lg: { max: '1024px' },
      xl: { max: '1280px' },
      '2xl': { max: '1536px' },
    },
  },
  plugins: [],
};

export default config;
