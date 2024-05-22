/** @type {import('tailwindcss').Config} */

import flowbite from "flowbite-react/tailwind";

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    flowbite.content(),
  ],
  theme: {
    fontFamily: {
      default: ['advent', 'sans-serif'],
      sans: ['open sans', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: {
            DEFAULT: "#afc6d8",
            900: "rgb(125,182,231)",
        },
        secondary: "#5a7483",
        danger: '#eb445',
        medium: 'rgb(51,65,84)',
        light: '#fafafa'
      }
    },
  },
  plugins: [
    flowbite.plugin(),
  ]
}

