/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        torigo: {
          DEFAULT: '#77160e',
          dark: '#4f0f0b',
          mid: '#b53b2b',
          light: '#ff7a66'
        }
        ,
        guinda: {
          DEFAULT: '#8B0000',
          dark: '#670000',
          light: '#b53b2b'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Montserrat', 'ui-sans-serif', 'system-ui'],
        heading: ['Poppins', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
}
