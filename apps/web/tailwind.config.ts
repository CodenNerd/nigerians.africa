/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1a1a1a",
          muted: "#4a4a4a",
          faint: "#6b6b6b",
        },
        paper: {
          DEFAULT: "#f7f5f0",
          card: "#ffffff",
          border: "#e2ddd3",
        },
        civic: {
          green: "#1b5e3b",
          greenSoft: "#e8f2ec",
          amber: "#8a6d1a",
          amberSoft: "#f5efd8",
          red: "#8b2e2e",
          redSoft: "#f5e4e4",
          blue: "#1e3a5f",
          blueSoft: "#e6eef6",
          slate: "#3d4a54",
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
