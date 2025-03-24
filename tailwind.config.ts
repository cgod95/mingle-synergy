
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // New Hinge-inspired color palette
        hinge: {
          coral: "#F3643E",
          navy: "#212832",
          background: "#F9F9F9",
          teal: "#BDD9DC",
          text: {
            primary: "#212832",
            secondary: "#7B8794",
          },
        },
      },
      spacing: {
        xs: '8px',
        sm: '12px', // Updated to use tighter spacing
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 0.25rem)",
        sm: "calc(var(--radius) - 0.5rem)",
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
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        pulse: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        heartBeat: {
          "0%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.3)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.3)" },
          "70%": { transform: "scale(1)" },
        },
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "pulse-once": "pulse 0.5s ease-in-out",
        "heart-beat": "heartBeat 1.3s ease-in-out",
        "float": "float 3s ease-in-out infinite",
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.05)', // Updated for more subtle shadows
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'button': '0 2px 8px rgba(243, 100, 62, 0.2)',
        'bubble': '0px 2px 8px rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        xs: "2px",
      },
      typography: {
        'heading-1': {
          css: {
            fontSize: '2rem',
            lineHeight: '2.5rem',
            fontWeight: '700',
          },
        },
        'heading-2': {
          css: {
            fontSize: '1.5rem',
            lineHeight: '2rem',
            fontWeight: '600',
          },
        },
        'body': {
          css: {
            fontSize: '1rem',
            lineHeight: '1.5rem',
            fontWeight: '400',
          },
        },
        'caption': {
          css: {
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            fontWeight: '400',
          },
        },
      },
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        'georgia': ['Georgia', 'Times New Roman', 'serif'],
        'sans': ['Inter', 'Basis Grotesque', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        'serif': ['Georgia', 'Tiempos Headline', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
