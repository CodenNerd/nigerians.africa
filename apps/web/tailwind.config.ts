/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          faint: "rgb(var(--ink-faint) / <alpha-value>)",
        },
        paper: {
          DEFAULT: "rgb(var(--paper) / <alpha-value>)",
          card: "rgb(var(--paper-card) / <alpha-value>)",
          border: "rgb(var(--paper-border) / <alpha-value>)",
        },
        civic: {
          green: "rgb(var(--civic-green) / <alpha-value>)",
          greenSoft: "rgb(var(--civic-green-soft) / <alpha-value>)",
          amber: "rgb(var(--civic-amber) / <alpha-value>)",
          amberSoft: "rgb(var(--civic-amber-soft) / <alpha-value>)",
          red: "rgb(var(--civic-red) / <alpha-value>)",
          redSoft: "rgb(var(--civic-red-soft) / <alpha-value>)",
          blue: "rgb(var(--civic-blue) / <alpha-value>)",
          blueSoft: "rgb(var(--civic-blue-soft) / <alpha-value>)",
          slate: "rgb(var(--civic-slate) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        measure: "68ch",
        site: "72rem",
      },
    },
  },
  plugins: [],
};
