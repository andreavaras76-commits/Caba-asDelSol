export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cielo: {
          50: '#EEF4FC',
          100: '#D6E5F7',
          200: '#ADCBEF',
          300: '#7FADE4',
          400: '#5A92D6',
          DEFAULT: '#3A78C9',
          600: '#2E62A7',
          700: '#244D84',
          800: '#1B3A63',
          900: '#122742',
        },
        sol: {
          50: '#FEF7EA',
          100: '#FDEBC8',
          200: '#FBD891',
          300: '#F9C564',
          DEFAULT: '#F6B23C',
          600: '#E0961A',
          700: '#B27412',
        },
        cerro: {
          50: '#E8F7EE',
          100: '#C4EBD3',
          300: '#5CC489',
          DEFAULT: '#0E9F4D',
          600: '#0B843F',
          profundo: '#2F5D3A',
          noche: '#1C3A24',
        },
        cabana: {
          DEFAULT: '#F2C230',
          light: '#F8DB7A',
          dark: '#D4A514',
        },
        madera: {
          light: '#A56E47',
          DEFAULT: '#7A4A2A',
          dark: '#55331C',
        },
        piedra: {
          light: '#D8D3CB',
          DEFAULT: '#B9B3A8',
          dark: '#8E887D',
        },
        crema: {
          DEFAULT: '#FBF6EC',
          dark: '#F3EADA',
        },
        carbon: {
          light: '#3A403C',
          DEFAULT: '#1F2421',
        },
        tejido: {
          DEFAULT: '#E8893A',
          dark: '#C96C22',
          ink: '#A3500E',
        },
      },
      fontFamily: {
        serif: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'serif'],
        script: ['Caveat', 'cursive'],
        sans: ['"Manrope Variable"', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        calida: '0 10px 30px -10px rgba(122, 74, 42, 0.25)',
        'calida-lg': '0 25px 60px -15px rgba(122, 74, 42, 0.35)',
        sol: '0 0 60px 10px rgba(246, 178, 60, 0.45)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        amanecer:
          'linear-gradient(180deg, #3A78C9 0%, #7FADE4 40%, #F9C564 80%, #F6B23C 100%)',
        atardecer: 'linear-gradient(135deg, #F6B23C 0%, #E8893A 50%, #7A4A2A 100%)',
      },
      keyframes: {
        'ken-burns': {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.12) translate(-1.5%, -1%)' },
        },
        'soft-ping': {
          '0%': { transform: 'scale(1)', opacity: '0.45' },
          '80%, 100%': { transform: 'scale(1.35)', opacity: '0' },
        },
        'sun-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'ken-burns': 'ken-burns 14s ease-out forwards',
        'sun-spin': 'sun-spin 120s linear infinite',
        'soft-ping': 'soft-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};
