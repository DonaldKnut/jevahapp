/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: [
        '"Plus Jakarta Sans"',
        "ui-sans-serif",
        "system-ui",
        "sans-serif",
      ],
      serif: [
        '"Plus Jakarta Sans"',
        "ui-sans-serif",
        "system-ui",
        "sans-serif",
      ],
      mono: [
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        "monospace",
      ],
    },
    extend: {
      colors: {
        jevah: {
          bg: "var(--jevah-bg)",
          surface: "var(--jevah-surface)",
          elevated: "var(--jevah-elevated)",
          muted: "var(--jevah-surface-muted)",
          text: "var(--jevah-text)",
          "text-muted": "var(--jevah-text-muted)",
          accent: "var(--jevah-accent)",
          "accent-hover": "var(--jevah-accent-hover)",
          border: "var(--jevah-border)",
          section: "var(--jevah-section-bg)",
          "section-muted": "var(--jevah-section-muted)",
          card: "var(--jevah-card-bg)",
          brand: "var(--jevah-brand-dark)",
          input: "var(--jevah-input-bg)",
        },
      },
    },
  },
  plugins: [],
}
