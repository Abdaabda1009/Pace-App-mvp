/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Light mode colors
        light: {
          primary: "rgba(245, 248, 250, 1)",
          secondary: "rgba(220, 230, 235, 1)",
          background: "rgba(255, 255, 255, 1)",
        },
        // Original dark mode colors (now maintained)
        primary: "rgba(18, 28, 41, 1)",
        secondary: "rgba(110, 130, 140, 1)", // Used for secondary buttons
        primaryGradient: {
          colors: [
            "rgba(18, 28, 41, 1)", // Color(red: 0.07, green: 0.11, blue: 0.16)
            "rgba(66, 99, 143, 1)", // Color(red: 0.26, green: 0.39, blue: 0.56)
          ],
          locations: [0.0, 1.0],
        },
        brandBlue: "#3A6D8E", // PACE text color
        brandBlueGradient: {
          colors: ["#3A6D8E", "#4D8EAF"],
          locations: [0.0, 1.0],
        },

        // Background colors
        backgroundGradientStart: "rgba(0, 15, 36, 1)",
        backgroundGradientEnd: "rgba(31, 38, 46, 1)",

        // Text colors
        textLight: "#FFFFFF",
        textDark: "#000000",

        // Status colors
        error: "#FF4D4D",
        success: "#4CAF50",
        warning: "#FFC107",
      },
    },
  },
  plugins: [],
};
