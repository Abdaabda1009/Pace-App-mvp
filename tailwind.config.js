/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "rgba(18, 28, 41, 1)",
        primaryGradient: {
          colors: [
            "rgba(18, 28, 41, 1)", // Color(red: 0.07, green: 0.11, blue: 0.16)
            "rgba(66, 99, 143, 1)", // Color(red: 0.26, green: 0.39, blue: 0.56)
          ],
          locations: [0.0, 1.0],
        },
        brandBlue: "#4D8EAF", // PACE text color
        brandBlueGradient: {
          colors: [
            "#3A6D8E", // Darker brand blue
            "#4D8EAF", // Main brand blue
          ],
          locations: [0.0, 1.0],
        },
        secondary: "rgba(110, 130, 140, 1)", // Used for secondary buttons

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
