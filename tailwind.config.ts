import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: ".5625rem", /* 9px */
        md: ".375rem", /* 6px */
        sm: ".1875rem", /* 3px */
        "app-input": "var(--app-radius-input)",
        "app-card": "var(--app-radius-card)",
      },
      colors: {
        // App design system – use these for consistent theming
        app: {
          primary: "var(--app-primary)",
          "primary-muted": "var(--app-primary-muted)",
          "primary-muted-hover": "var(--app-primary-muted-hover)",
          "text-primary": "var(--app-text-primary)",
          "text-secondary": "var(--app-text-secondary)",
          "text-muted": "var(--app-text-muted)",
          surface: {
            bg: "var(--app-surface-bg)",
            card: "var(--app-surface-card)",
            elevated: "var(--app-surface-elevated)",
            button: "var(--app-surface-button)",
          },
          border: "var(--app-border)",
          "border-strong": "var(--app-border-strong)",
        },
        // Flat / base colors (regular buttons)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
        status: {
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },
        gold: "rgb(255 201 64)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      letterSpacing: {
        "app-title": "var(--app-tracking-title)",
        "app-title-onboarding": "var(--app-tracking-title-onboarding)",
        "app-subtitle": "var(--app-tracking-subtitle)",
        "app-subtitle-onboarding": "var(--app-tracking-subtitle-onboarding)",
        "app-section": "var(--app-tracking-section-title)",
        "app-body": "var(--app-tracking-body)",
        "app-body-small": "var(--app-tracking-body-small)",
        "app-card-title": "var(--app-tracking-card-title)",
        "app-footer": "var(--app-tracking-footer)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "chat-bubble-enter": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "bubble-appear": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "chat-bubble-enter": "chat-bubble-enter 0.3s ease-out forwards",
        "bubble-appear": "bubble-appear 0.45s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
