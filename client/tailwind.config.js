/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // "./index.html",
    "./src/**/*.{js,jsx}", 
  ],
  theme: {
    colors:{
      paleBlue: "#afeeee",
      purple: "#800080",
      softWhite: "#FAF9F6",
      lightGray: "#D3D3D3",
      white: "#ffffff",
      coolGrey: "#8C92AC",
      main  : "#388087",
      submain:"#C2EDCE",
      last:"#F6F6F2",
      black:"#000000",
      mid:"#badfe7",
      green:"#00ff00",
      red:"#ff0000",
    },
    extend: {
      boxShadow: {
        "purple-blue": "0.4em 0.6em 2em rgb(63, 44, 187 / 40%1111);",
        "blue-back": "0.3em 0.3em 1em rgb(7 9 102 / 30%);",
      },
      
    },
  },
  plugins: [],
}

