import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sidebar: {
          bg: "var(--sidebar-bg)",
          border: "var(--sidebar-border)",
          text: "var(--sidebar-text)",
          muted: "var(--sidebar-text-muted)",
          hover: "var(--sidebar-hover)",
        },
        content: {
          bg: "var(--content-bg)",
        },
        card: {
          bg: "var(--card-bg)",
          border: "var(--card-border)",
        },
        admin: {
          active: "var(--active-color-admin)",
          activeBg: "var(--active-bg-admin)",
        },
        unit: {
          active: "var(--active-color-unit)",
          activeBg: "var(--active-bg-unit)",
        },
        status: {
          success: "var(--success)",
          warning: "var(--warning)",
          error: "var(--error)",
          info: "var(--info)",
        },
      },
      boxShadow: {
        card: "var(--card-shadow)",
      },
    },
  },
  plugins: [],
};

export default config;
