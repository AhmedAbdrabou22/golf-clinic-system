/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12213A",
        paper: "#F6F7F4",
        primary: {
          50: "#E9F5F2",
          100: "#CFEAE3",
          200: "#9ED4C7",
          400: "#3E9683",
          500: "#0F6E5F",
          600: "#0C5A4E",
          700: "#0A473F",
          900: "#062A25",
        },
        coral: {
          400: "#EA6B52",
          500: "#E2543A",
          600: "#C0432C",
        },
        amber: {
          100: "#FBEFD6",
          400: "#E2AE4E",
          500: "#D9A441",
        },
        mint: {
          100: "#E7F3EF",
        },
      },
      fontFamily: {
        display: ["Cairo", "Tajawal", "sans-serif"],
        body: ["Tajawal", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 24px -12px rgba(18, 33, 58, 0.18)",
        card: "0 1px 2px rgba(18,33,58,0.06), 0 8px 20px -14px rgba(18,33,58,0.15)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};
