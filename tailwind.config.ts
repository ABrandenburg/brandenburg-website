import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
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
        brand: {
          red: '#C41E3A',
          blue: '#324759',
        },
        text: {
          primary: '#1A1A1A',
          muted: '#6B7280',
        },
        btn: {
          primary: '#324759',
        },
        footer: {
          bg: '#F9FAFB',
        },
      },
      fontFamily: {
        serif: ['freight-text-pro', 'Georgia', 'serif'],
        sans: ['neue-haas-grotesk-text', 'system-ui', 'sans-serif'],
        display: ['neue-haas-grotesk-display', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 2px 4px 0 rgba(0, 0, 0, 0.03), 0 4px 8px 0 rgba(0, 0, 0, 0.06)',
        'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 6px 12px -2px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 16px -4px rgba(0, 0, 0, 0.06), 0 12px 24px -6px rgba(0, 0, 0, 0.1)',
        'soft-xl': '0 16px 32px -8px rgba(0, 0, 0, 0.08), 0 24px 48px -12px rgba(0, 0, 0, 0.12)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 8px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.1)',
        'button': '0 1px 2px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.1)',
        'button-hover': '0 2px 4px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.12)',
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#1A1A1A',
            lineHeight: '1.75',
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            h4: {
              color: '#1A1A1A',
              fontWeight: '700',
              marginTop: '2em',
              marginBottom: '0.75em',
              fontFamily: 'freight-text-pro, Georgia, serif',
            },
            strong: {
              color: '#1A1A1A',
              fontWeight: '600',
            },
            ul: {
              marginTop: '1em',
              marginBottom: '1em',
              paddingLeft: '1.5em',
            },
            ol: {
              marginTop: '1em',
              marginBottom: '1em',
              paddingLeft: '1.5em',
            },
            li: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            a: {
              color: '#324759',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
