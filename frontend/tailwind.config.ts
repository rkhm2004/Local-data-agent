import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0A0A0A",
          darkGray: "#141414",
          orange: "#FF6600",
          orangeMuted: "#CC5200",
          amberGlow: "rgba(255, 102, 0, 0.15)"
        }
      }
    },
  },
  plugins: [],
};
export default config;