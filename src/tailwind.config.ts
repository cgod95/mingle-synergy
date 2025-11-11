import type { Config } from "tailwindcss";
import colors from 'tailwindcss/colors';
import tailwindcssAnimate from 'tailwindcss-animate';

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
        bg: {
          primary: "#F8F7F4",
          secondary: "#FFFFFF",
          tertiary: "#F0F2F5",
        },
        text: {
          primary: "#2D3748",
          secondary: "#4A5568",
          tertiary: "#718096",
        },
        brand: {
          primary: "#6366F1",  // indigo-600
          secondary: "#9333EA", // purple-600
          accent: "#818CF8", // indigo-400
          muted: "#C7D2FE", // indigo-200
        },
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
      },
      spacing: {
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        'card': '0 2px 8px rgba(0, 0, 0, 0.05)', // Updated for more subtle shadows
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'button': '0 2px 8px rgba(243, 100, 62, 0.2)',
        'bubble': '0px 2px 8px rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        'georgia': ['Georgia', 'Times New Roman', 'serif'],
        'sans': ['Inter', 'Basis Grotesque', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        'serif': ['Georgia', 'Tiempos Headline', 'Times New Roman', 'serif'],
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
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
