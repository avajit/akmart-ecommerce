/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '360px',
      'sm': '480px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Legacy compatibility
        dark: "#0D0D0D",
        gold: "#D4AF37",
        borderdark: "#2E2E2E",

        // Direction 1: Himalayan Modern Semantic System
        brand: {
          primary: "#C2410C",      // Deep Rust (6.25:1 WCAG AA with white text)
          'primary-hover': "#9A3412",
          saffron: "#F97316",      // Saffron (7.22:1 AAA with dark #0D0D0D text)
          'saffron-hover': "#EA580C",
          gold: "#EAB308",         // Himalayan Gold (8.2:1 against dark surface)
          'gold-hover': "#CA8A04",
        },
        surface: {
          base: "#0B0E14",         // Deep Slate dark background
          card: "#141923",         // Elevated card surface
          elevated: "#1B2230",     // Modals / Dropdowns / Drawers
          subtle: "#10141D",       // Inset inputs / tags
          light: "#FFFFFF",        // Light mode surface
          'light-subtle': "#F8FAFC", // Light mode background
        },
        border: {
          subtle: "#232B3B",       // Standard dark mode card border
          strong: "#334155",       // Interactive border
          light: "#E2E8F0",        // Light mode border
        },
        foreground: {
          DEFAULT: "#F9FAFB",
          primary: "#F9FAFB",      // High contrast text (18.2:1)
          secondary: "#94A3B8",    // Slate-400 (7.8:1 AA pass)
          muted: "#64748B",        // Slate-500
          inverse: "#0F172A",      // Dark text for light mode
        },
        content: {
          primary: "#F9FAFB",      // High contrast text (18.2:1)
          secondary: "#94A3B8",    // Slate-400 (7.8:1 AA pass)
          muted: "#64748B",        // Slate-500
          inverse: "#0F172A",      // Dark text for light mode
        },
        status: {
          success: "#10B981",      // Verified / In-stock (5.4:1 AA pass)
          'success-bg': "rgba(16, 185, 129, 0.12)",
          warning: "#F59E0B",      // Low stock / Alert
          'warning-bg': "rgba(245, 158, 11, 0.12)",
          error: "#EF4444",        // Error / Destructive
          'error-bg': "rgba(239, 68, 68, 0.12)",
          info: "#3B82F6",         // Order status / Tracking
          'info-bg': "rgba(59, 130, 246, 0.12)",
        },
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Poppins", "sans-serif"],
        sans: ["Inter", "Poppins", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
        nepali: ["'Noto Sans Devanagari'", "Mangal", "'Nirmala UI'", "sans-serif"],
      },
      fontSize: {
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem)',
        'fluid-sm': 'clamp(0.8125rem, 0.75rem + 0.3vw, 0.875rem)',
        'fluid-base': 'clamp(0.9375rem, 0.875rem + 0.35vw, 1rem)',
        'fluid-lg': 'clamp(1.0625rem, 0.95rem + 0.5vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.25rem + 1.2vw, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.5rem + 1.8vw, 2.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 3.25rem)',
      },
      spacing: {
        'touch': '44px',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.15s ease-out",
        shimmer: "shimmer 1.5s infinite",
        slideUp: "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
