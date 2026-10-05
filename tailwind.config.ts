import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171214",
        ink2: "#221b1e",
        cream: "#f5efe6",
        muted: "#b9aea4",
        neonTeal: "#2dd4bf",
        neonCoral: "#fb7185",
        neonViolet: "#a78bfa",
        neonLime: "#a3e635",
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
