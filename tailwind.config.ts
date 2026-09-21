import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        ibm: ["'IBM Plex Sans Arabic'", "sans-serif"],
      },
      colors: {
        brand: {
          orange: "#eb842d",
          orangeDark: "#d26f1c",
          orangeLight: "#ff9c4b",
          dark: "#332d24",
          darkMuted: "#5e5445",
          cream: "#fce8dd",
          creamLight: "#fff6f0",
          creamBorder: "rgba(235, 132, 45, 0.2)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
