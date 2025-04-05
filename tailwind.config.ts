import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'repower-dark-blue': '#253551',
      }
    },
  },
  plugins: [],
} satisfies Config;
