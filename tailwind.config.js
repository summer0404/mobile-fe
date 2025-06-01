/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./components/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED",
          100: "#c4B5FD",
          200: "#EDE9FE"
        },
        secondary: {
          DEFAULT: "#FDE047",
        },
        textMuted: '#A0A0A0',
      },
      fontFamily: {
        pthin: ["Poppins-Thin", "sans-serif"],
        pextralight: ["Poppins-ExtraLight", "sans-serif"],
        plight: ["Poppins-Light", "sans-serif"],
        pregular: ["Poppins-Regular", "sans-serif"],
        pmedium: ["Poppins-Medium", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        pbold: ["Poppins-Bold", "sans-serif"],
        pextrabold: ["Poppins-ExtraBold", "sans-serif"],
        pblack: ["Poppins-Black", "sans-serif"],
      },
    },
  },
  plugins: [],
  safelist: [
    // Background colors from categories.ts
    'bg-orange-100',
    'bg-green-100',
    'bg-blue-100',
    'bg-red-100',
    'bg-cyan-100',
    'bg-pink-100',
    'bg-purple-100',
    'bg-rose-100',
    'bg-teal-100',
    'bg-indigo-100',
    'bg-amber-100',
    'bg-gray-100',

    // Icon colors (text colors) from categories.ts
    'text-orange-500',
    'text-green-500',
    'text-blue-500',
    'text-red-500',
    'text-cyan-500',
    'text-pink-500',
    'text-purple-500',
    'text-rose-500',
    'text-teal-500',
    'text-indigo-500',
    'text-amber-500',
    'text-gray-500',

    // You can also use patterns if you have many and they follow a consistent structure:
    // {
    //   pattern: /bg-(orange|green|blue|red|cyan|pink|purple|rose|teal|indigo|amber|gray)-(100)/,
    // },
    // {
    //   pattern: /text-(orange|green|blue|red|cyan|pink|purple|rose|teal|indigo|amber|gray)-(500)/,
    // },
  ],
};
