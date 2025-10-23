/** @type {import('tailwindcss').Config} */
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
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			// Semantic tokens (using OKLCH)
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			// Base color palette
  			blue: {
  				50: 'var(--color-blue-50)',
  				100: 'var(--color-blue-100)',
  				200: 'var(--color-blue-200)',
  				300: 'var(--color-blue-300)',
  				400: 'var(--color-blue-400)',
  				500: 'var(--color-blue-500)',
  				600: 'var(--color-blue-600)',
  				700: 'var(--color-blue-700)',
  				800: 'var(--color-blue-800)',
  				900: 'var(--color-blue-900)',
  				950: 'var(--color-blue-950)',
  			},
  			purple: {
  				50: 'var(--color-purple-50)',
  				100: 'var(--color-purple-100)',
  				200: 'var(--color-purple-200)',
  				300: 'var(--color-purple-300)',
  				400: 'var(--color-purple-400)',
  				500: 'var(--color-purple-500)',
  				600: 'var(--color-purple-600)',
  				700: 'var(--color-purple-700)',
  				800: 'var(--color-purple-800)',
  				900: 'var(--color-purple-900)',
  				950: 'var(--color-purple-950)',
  			},
  			teal: {
  				50: 'var(--color-teal-50)',
  				100: 'var(--color-teal-100)',
  				200: 'var(--color-teal-200)',
  				300: 'var(--color-teal-300)',
  				400: 'var(--color-teal-400)',
  				500: 'var(--color-teal-500)',
  				600: 'var(--color-teal-600)',
  				700: 'var(--color-teal-700)',
  				800: 'var(--color-teal-800)',
  				900: 'var(--color-teal-900)',
  				950: 'var(--color-teal-950)',
  			},
  			orange: {
  				50: 'var(--color-orange-50)',
  				100: 'var(--color-orange-100)',
  				200: 'var(--color-orange-200)',
  				300: 'var(--color-orange-300)',
  				400: 'var(--color-orange-400)',
  				500: 'var(--color-orange-500)',
  				600: 'var(--color-orange-600)',
  				700: 'var(--color-orange-700)',
  				800: 'var(--color-orange-800)',
  				900: 'var(--color-orange-900)',
  				950: 'var(--color-orange-950)',
  			},
  			pink: {
  				50: 'var(--color-pink-50)',
  				100: 'var(--color-pink-100)',
  				200: 'var(--color-pink-200)',
  				300: 'var(--color-pink-300)',
  				400: 'var(--color-pink-400)',
  				500: 'var(--color-pink-500)',
  				600: 'var(--color-pink-600)',
  				700: 'var(--color-pink-700)',
  				800: 'var(--color-pink-800)',
  				900: 'var(--color-pink-900)',
  				950: 'var(--color-pink-950)',
  			},
  			'light-blue': {
  				50: 'var(--color-light-blue-50)',
  				100: 'var(--color-light-blue-100)',
  				200: 'var(--color-light-blue-200)',
  				300: 'var(--color-light-blue-300)',
  				400: 'var(--color-light-blue-400)',
  				500: 'var(--color-light-blue-500)',
  				600: 'var(--color-light-blue-600)',
  				700: 'var(--color-light-blue-700)',
  				800: 'var(--color-light-blue-800)',
  				900: 'var(--color-light-blue-900)',
  				950: 'var(--color-light-blue-950)',
  			},
  			lime: {
  				50: 'var(--color-lime-50)',
  				100: 'var(--color-lime-100)',
  				200: 'var(--color-lime-200)',
  				300: 'var(--color-lime-300)',
  				400: 'var(--color-lime-400)',
  				500: 'var(--color-lime-500)',
  				600: 'var(--color-lime-600)',
  				700: 'var(--color-lime-700)',
  				800: 'var(--color-lime-800)',
  				900: 'var(--color-lime-900)',
  				950: 'var(--color-lime-950)',
  			},
  			yellow: {
  				50: 'var(--color-yellow-50)',
  				100: 'var(--color-yellow-100)',
  				200: 'var(--color-yellow-200)',
  				300: 'var(--color-yellow-300)',
  				400: 'var(--color-yellow-400)',
  				500: 'var(--color-yellow-500)',
  				600: 'var(--color-yellow-600)',
  				700: 'var(--color-yellow-700)',
  				800: 'var(--color-yellow-800)',
  				900: 'var(--color-yellow-900)',
  				950: 'var(--color-yellow-950)',
  			},
  			green: {
  				50: 'var(--color-green-50)',
  				100: 'var(--color-green-100)',
  				200: 'var(--color-green-200)',
  				300: 'var(--color-green-300)',
  				400: 'var(--color-green-400)',
  				500: 'var(--color-green-500)',
  				600: 'var(--color-green-600)',
  				700: 'var(--color-green-700)',
  				800: 'var(--color-green-800)',
  				900: 'var(--color-green-900)',
  				950: 'var(--color-green-950)',
  			},
  			red: {
  				50: 'var(--color-red-50)',
  				100: 'var(--color-red-100)',
  				200: 'var(--color-red-200)',
  				300: 'var(--color-red-300)',
  				400: 'var(--color-red-400)',
  				500: 'var(--color-red-500)',
  				600: 'var(--color-red-600)',
  				700: 'var(--color-red-700)',
  				800: 'var(--color-red-800)',
  				900: 'var(--color-red-900)',
  				950: 'var(--color-red-950)',
  			},
  			gray: {
  				50: 'var(--color-gray-50)',
  				100: 'var(--color-gray-100)',
  				200: 'var(--color-gray-200)',
  				300: 'var(--color-gray-300)',
  				400: 'var(--color-gray-400)',
  				500: 'var(--color-gray-500)',
  				600: 'var(--color-gray-600)',
  				700: 'var(--color-gray-700)',
  				800: 'var(--color-gray-800)',
  				900: 'var(--color-gray-900)',
  				950: 'var(--color-gray-950)',
  			},
  			neutral: {
  				50: 'var(--color-neutral-50)',
  				100: 'var(--color-neutral-100)',
  				200: 'var(--color-neutral-200)',
  				300: 'var(--color-neutral-300)',
  				400: 'var(--color-neutral-400)',
  				500: 'var(--color-neutral-500)',
  				600: 'var(--color-neutral-600)',
  				700: 'var(--color-neutral-700)',
  				800: 'var(--color-neutral-800)',
  				900: 'var(--color-neutral-900)',
  				950: 'var(--color-neutral-950)',
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
